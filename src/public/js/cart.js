// Conectar al servidor de Socket.io
const socket = io();

// Escuchar eventos de conexión y desconexión
socket.on("connect", () => {
  console.log("Cliente conectado al servidor");
});

socket.on("disconnect", () => {
  console.log("Cliente desconectado del servidor");
});

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", async function () {

  //Chequeo de carrito lleno/vacío e ID.
  const cartId = localStorage.getItem("cartId");

  if (!cartId) {
    console.error("ID del carrito no válido.");
    return;
  }

  const carritoLleno = document.getElementById("carritoLleno");
  function carritoVacio() {
    carritoLleno.innerHTML = `<p class="center">El Carrito está vacío</p>`;
  }

  // Obtener el carrito inicial
  try {
    const response = await fetch(`/api/carts/${cartId}`);
    if (response.ok) {
      const carrito = await response.json();

      if (carrito.carritoEncontrado.products.length > 0) {
        // Elementos del DOM
        const cartList = document.getElementById("listado");
        const clearCartBtn = document.getElementById("clearCart");
        const checkoutBtn = document.getElementById("checkout");

        // Escuchar evento de actualización del carrito
        socket.on("Cart Update", (updatedCart) => {
          console.log("Carrito Actualizado:", updatedCart);
          updateCartView(updatedCart);
        });

        // Evento para eliminar todos los productos del carrito
        clearCartBtn.addEventListener("click", async () => {
          try {
            const response = await fetch(`/api/carts/${cartId}`, {
              method: "DELETE",
            });

            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const updatedCart = await response.json();
            socket.emit("Cart Update", updatedCart);
            carritoVacio();
            tostada("Carrito vacío, todos los productos eliminados");
          } catch (error) {
            console.error(
              "Error al eliminar todos los productos del carrito:",
              error.message
            );
          }
        });

        //Botón de checkout para vaciar carrito y volver a la página inicial. Elimina el ID del local storage.
        checkoutBtn.addEventListener("click", async () => {
          tostada("Compra realizada exitosamente");

          setTimeout(() => {
            localStorage.removeItem("cartId");
            window.location.href = "/";
          }, 2000);
        });

        // Actualizar la vista del carrito, luego de haber actualizado algún producto.
        function updateCartView(cart) {
          // Limpiar la lista actual
          cartList.innerHTML = "";
          if (cart.products.length == 0) {
            carritoVacio();
          } else {
            cart.products.forEach((product) => {
              const productElement = document.createElement("div");
              productElement.classList.add("productoBox");
              productElement.innerHTML = `<h3 class="flex1c">${
                product.title
              }</h3>
            <p class="flex2c">Precio: $${product.price}</p>
            <p class="flex2c">Cantidad: ${product.quantity}</p>
            <p class="flex2c">Stock: ${product.stock}</p>

            <input
              type="number"
              name="quantity"
              min="1"
              max="${product.stock + product.quantity}"
              value="${product.quantity}"
              class="flex3c"
              data-product-id="${product._id}"
            />
            <button
              class="flex4c btn-update"
              data-product-idu="${product._id}"
            >Actualizar</button>
            <button
              class="flex4c btn-remove"
              data-product-idr="${product._id}"
            >Eliminar</button>    `;
              cartList.appendChild(productElement);
            });

            const totalPriceElement = document.getElementById("total");
            if (totalPriceElement) {
              const totalPrice = cart.products
                .reduce(
                  (acc, product) => acc + product.price * product.quantity,
                  0
                )
                .toFixed(2);
              totalPriceElement.textContent = `Total: $${totalPrice}`;
            } else {
              console.error("Elemento para el total no encontrado en el DOM.");
            }
          }
        }

        // Evento para actualizar la cantidad de un producto en el carrito
        document.addEventListener("click", async (event) => {

          //Evento de modificación de cantidad
          if (event.target.classList.contains("btn-update")) {
            const productId = event.target.getAttribute("data-product-idu");
            const quantityInput = event.target.previousElementSibling;
            const quantity = parseInt(quantityInput.value);

            if (isNaN(quantity) || quantity <= 0) {
              tostada("La cantidad debe ser un número positivo.");
              return;
            }

            try {
              const response = await fetch(
                `
                /api/carts/${cartId}/product/${productId}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ productId, quantity }),
                }
              );

              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }

              const updatedCart = await response.json();
              tostada("Cantidad de producto actualizado");
              socket.emit("Cart Update", updatedCart);
            } catch (error) {
              console.error(
                "Error al actualizar la cantidad del producto:",
                error.message
              );
            }
          }
 
          //Evento de eliminación de producto.
          if (event.target.classList.contains("btn-remove")) {
            const productId = event.target.getAttribute("data-product-idr");

            try {
              const response = await fetch(
                `
                /api/carts/${cartId}/product/${productId}`,
                {
                  method: "DELETE",
                }
              );

              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }

              const updatedCart = await response.json();
              tostada("Producto Eliminado");
              socket.emit("Cart Update", updatedCart);
            } catch (error) {
              console.error(
                "Error al eliminar el producto del carrito:",
                error.message
              );
            }
          }
        });
      } else {
        carritoVacio();
      }
    } else {
      console.error("Error al obtener el carrito:", response.statusText);
    }
  } catch (error) {
    console.error("Error al obtener el carrito:", error.message);
  }
});
