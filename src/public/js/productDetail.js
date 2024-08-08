document.addEventListener("DOMContentLoaded", function () {
  const cartId = parseInt(localStorage.getItem("cartId"));
  const cartLink = document.getElementById("cartLink");
  cartLink.href = `/carts/${cartId}`;

  const addToCartButton = document.getElementById("add-to-cart");
  if (addToCartButton) {
    const agregadoAlCarrito = document.getElementById("agregarCarritoOk");

    addToCartButton.addEventListener("click", async function () {
      try {
        let cartId = parseInt(localStorage.getItem("cartId"));
        console.log("cart", cartId);

        const productId = this.getAttribute("data-product-id");
        const quantity = document.getElementById("quantity").value;

        const response = await fetch(
          `/api/carts/${cartId}/products/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId, quantity }),
          }
        );

        if (response.ok) {
          agregadoAlCarrito.innerText = "Producto Agregado al carrito";
        } else {
          throw new Error("No se pudo agregar el producto al carrito");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }
});
