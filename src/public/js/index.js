// Conectar al servidor de Socket.io
const socket = io();

// Escuchar eventos de conexión y desconexión
socket.on("connect", () => {
  console.log("Cliente conectado al servidor");
});

socket.on("disconnect", () => {
  console.log("Cliente desconectado del servidor");
});

// Función para crear un nuevo carrito
const createNewCart = async () => {
  try {
    const response = await fetch("/api/carts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("cartId", data.newCart._id);
      socket.emit("cartId", data.newCart._id);
      tostada("!Bienvenido! Tu carrito te espera");
      console.log(`Nuevo carrito creado con ID: ${data.newCart._id}`);
      return data.newCart._id;
    } else {
      console.error("Error al crear el carrito:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return null;
  }
};

// Verificar si el ID del carrito ya está en localStorage
const getCartId = async () => {
  let cartId = localStorage.getItem("cartId");

  if (!cartId) {
    cartId = await createNewCart();
  } 
  socket.emit("cartId", cartId);

  return cartId;
};

// Función para actualizar el enlace del carrito
const updateCartLink = async () => {
  const cartId = await getCartId();
  if (cartId) {
    const cartLink = document.getElementById("cartLink");
    cartLink.href = `/carts/${cartId}`;
    console.log(`Carrito ya existente con ID: ${cartId}`);
  }
};

// Función para agregar un producto al carrito
const addToCart = async (productId) => {
  const cartId = await getCartId();
  if (cartId) {
    try {
      const response = await fetch(
        `/api/carts/${cartId}/product/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        }
      );

      if (response.ok) {
        tostada("Producto agreado al carrito.");
        socket.emit("Product Update", productId);
      } else {
        throw new Error("No se pudo agregar el producto al carrito");
      }
    } catch (error) {
      console.error("Error:", error);
      tostada("Error al agregar el producto al carrito");
    }
  }
};

// Escuchar el evento Product Update y actualizar la vista
socket.on("Product Update", (updatedProduct) => {
  console.log("Producto Actualizado:", updatedProduct);

  const stockElement = document.querySelector(
    `p[data-product-ids="${updatedProduct._id}"]`
  );

  if (stockElement) {
    // Actualizar el stock en la vista
    stockElement.innerHTML = `Stock: ${updatedProduct.stock}`;
  }
});

// Añadir eventos a los botones de "Agregar al Carrito"
document.addEventListener("DOMContentLoaded", () => {
  updateCartLink();

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-product-id");
      addToCart(productId);
    });
  });
});
