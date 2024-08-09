// Conectar al servidor de Socket.io
const socket = io();

// Escuchar eventos de conexión y desconexión
socket.on("connect", () => {
  console.log("Cliente conectado al servidor");
});

socket.on("disconnect", () => {
  console.log("Cliente desconectado del servidor");
});

// Manejar el evento Product Update para actualizar el stock en la vista de detalles
socket.on("Product Update", (updatedProduct) => {
  console.log("Producto Actualizado:", updatedProduct);

  // Actualizar el stock en la vista
  const stockElement = document.querySelector(
    `p[data-product-ids="${updatedProduct._id}"]`
  );
  if (stockElement) {
    stockElement.innerHTML = `<strong>Stock:</strong> ${updatedProduct.stock}`;
    const quantityInput = document.getElementById("quantity");
    if (quantityInput) {
      quantityInput.max = updatedProduct.stock; // Actualizar el máximo del input
    }
  }
});

// Función para verificar si el producto está en el carrito
const isProductInCart = async (cartId, productId) => {
  try {
    const response = await fetch(`/api/carts/${cartId}`);
    if (response.ok) {
      const cart = await response.json();
      return cart.carritoEncontrado.products.some(
        (product) => product._id.toString() === productId
      );
    } else {
      throw new Error("No se pudo obtener el carrito.");
    }
  } catch (error) {
    console.error("Error al verificar el producto en el carrito:", error);
    return false;
  }
};

// Función para agregar un producto al carrito
const addToCart = async (cartId, productId, quantity) => {
  try {
    const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (response.ok) {
      // Emitir un evento para actualizar el stock
      socket.emit("Product Update", productId);
      tostada("Producto agregado al carrito");
    } else {
      throw new Error("No se pudo agregar el producto al carrito");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Función para manejar la carga de la página de detalles
document.addEventListener("DOMContentLoaded", async function () {
  let cartId = localStorage.getItem("cartId");
  const cartLink = document.getElementById("cartLink");
  cartLink.href = `/carts/${cartId}`;
  console.log(`Carrito ya existente con ID: ${cartId}`);

  // Verificar si el ID del carrito ya está en localStorage
  const getCartId = async () => {
    let cartId = localStorage.getItem("cartId");

    if (!cartId) {
      cartId = await createNewCart();
    }
    socket.emit("cartId", cartId);

    return cartId;
  };

  const getQT = async () => {
    let cartId = localStorage.getItem("cartId");
    try {
      const response = await fetch(`/api/carts/${cartId}/QT`);
      if (response.ok) {
        const data = await response.json(); // or response.text() depending on the expected format
        cartCount.innerText = data.totalProductos;
      } else {
        console.error(`Error fetching QT: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    getQT();
  }

  // Escuchar actualizaciones de productos desde el servidor
  socket.on("Cart Update", (updatedCart) => {
    console.log("Carrito actualizado:", updatedCart);
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      getQT();
    }
  });

  const productId = document
    .getElementById("add-to-cart")
    ?.getAttribute("data-product-id");
  const addToCartButton = document.getElementById("add-to-cart");
  const agregadoAlCarrito = document.getElementById("agregarCarritoOk");

  if (addToCartButton && cartId && productId) {
    const productInCart = await isProductInCart(cartId, productId);

    if (productInCart) {
      // Ocultar el botón si el producto ya está en el carrito
      addToCartButton.style.display = "none";
      agregadoAlCarrito.innerText =
        "El producto ya está en tu carrito, ir al mismo para editar la cantidad.";
    } else {
      addToCartButton.addEventListener("click", async function () {
        const quantity = document.getElementById("quantity").value;
        await addToCart(cartId, productId, quantity);
        agregadoAlCarrito.innerText = "Producto Agregado al carrito";
      });
    }
  }
});
