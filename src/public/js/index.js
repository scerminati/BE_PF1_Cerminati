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
      localStorage.setItem("cartId", data.newCart.id);
      console.log(`Nuevo carrito creado con ID: ${data.newCart.id}`);
      return data.newCart.id;
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
        alert("Producto agregado al carrito");
      } else {
        throw new Error("No se pudo agregar el producto al carrito");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al agregar el producto al carrito");
    }
  }
};

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
