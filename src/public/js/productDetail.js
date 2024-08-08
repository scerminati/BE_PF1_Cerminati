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
  console.log("Stock Element:", stockElement);
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
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (response.ok) {
      const updatedCart = await response.json();
      console.log("acá estoy", productId);
      // Emitir un evento para actualizar el stock
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

  const productId = document
    .getElementById("add-to-cart")
    ?.getAttribute("data-product-id");
  const addToCartButton = document.getElementById("add-to-cart");
  const agregadoAlCarrito = document.getElementById("agregarCarritoOk");

  if (addToCartButton && cartId && productId) {
    const productInCart = await isProductInCart(cartId, productId);
    console.log("entré, todo ok");
    if (productInCart) {
      addToCartButton.style.display = "none"; // Ocultar el botón si el producto ya está en el carrito
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
