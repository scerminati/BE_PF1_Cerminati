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
    // Actualizar el máximo del input
    const quantityInput = document.getElementById("quantity");
    if (quantityInput) {
      quantityInput.max = updatedProduct.stock; 
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
      tostada("Producto agregado al carrito");
      socket.emit("Product Update", productId);
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

  //Función para manipulación de cart count.
  const getQT = async () => {
    let cartId = localStorage.getItem("cartId");
    try {
      const response = await fetch(`/api/carts/${cartId}/QT`);
      if (response.ok) {
        const data = await response.json();
        cartCount.innerText = data.totalProductos;
      } else {
        console.error(`Error ak cargar QT: ${response.statusText}`);
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
    // Ocultar el botón si el producto ya está en el carrito
    const productInCart = await isProductInCart(cartId, productId);
    if (productInCart) {
      addToCartButton.style.display = "none";
      agregadoAlCarrito.innerText =
        "El producto ya está en tu carrito, ir al mismo para editar la cantidad.";
    } else {
      //Agregar producto al carrito, habilita la carga.
      addToCartButton.addEventListener("click", async function () {
        const quantity = document.getElementById("quantity").value;
        await addToCart(cartId, productId, quantity);
        agregadoAlCarrito.innerText = "Producto Agregado al carrito";
      });
    }
  }
});
