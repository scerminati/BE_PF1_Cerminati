// Conectar al servidor de Socket.io
const socket = io();

// Escuchar eventos de conexión y desconexión
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
  const productList = document.getElementById("listado");
  const productForm = document.getElementById("productForm");
  const titleInput = document.getElementById("title");
  const descriptionInput = document.getElementById("description");
  const codeInput = document.getElementById("code");
  const priceInput = document.getElementById("price");
  const stockInput = document.getElementById("stock");
  const categoryInput = document.getElementById("category");
  const thumbnailInput = document.getElementById("thumbnail");
  const thumbnailPreview = document.getElementById("thumbnailPreview");
  const productIdInput = document.getElementById("productId");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");
  const tituloHTML = document.getElementById("tituloHTML");
  const addProdbtn = document.getElementById("addProdbtn");
  const addProdForm = document.getElementById("addProdForm");
  const cancel = document.getElementById("cancel");
  const listado = document.getElementById("listado");

  // Escuchar evento de actualización de producto
  socket.on("Product Update", (updatedProduct) => {
    console.log("Producto Actualizado:", updatedProduct);

    const existingProduct = document.getElementById(updatedProduct.id);

    if (existingProduct) {
      // Actualizar detalles del producto en la lista
      existingProduct.innerHTML = innerHTMLtext(updatedProduct);
    } else {
      // Agregar nuevo producto a la lista
      const newProductItem = document.createElement("div");

      newProductItem.setAttribute("id", updatedProduct.id);
      newProductItem.classList.add("productoBox");
      newProductItem.innerHTML = innerHTMLtext(updatedProduct);
      productList.appendChild(newProductItem);
    }
  });

  // Escuchar evento de eliminación de producto
  socket.on("Product Deleted", (deletedProduct) => {
    console.log("Producto Eliminado:", deletedProduct);

    const existingProduct = document.getElementById(deletedProduct.id);
    if (existingProduct) {
      existingProduct.remove();
    }
  });

  //Botón que me permite ver el formulario

  addProdbtn.addEventListener("click", () => {
    addProdForm.style.display = "inline";
    addProdbtn.style.display = "none";
  });

  // Evento para enviar el formulario de producto
  productForm.addEventListener("submit", async (event) => {
    handleSubmit(event);
  });
  //Función handleSubmit, me permite linkear con modificar un producto
  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(productForm);

    // Validar el formulario HTML5
    if (!productForm.checkValidity()) {
      productForm.reportValidity();
      return;
    }
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newProduct = await response.json();

      // Emitir evento de actualización de producto a través de Socket.io
      socket.emit("Product Update", newProduct.newProduct);

      cancelOp();
      listado.scrollTop = listado.scrollHeight;
    } catch (error) {
      console.error("Error al agregar el producto:", error.message);
    }
  }

  // Evento para eliminar un producto
  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("btn-delete")) {
      const productId = event.target.getAttribute("data-product-id");

      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const deletedProduct = await response.json();

        // Emitir evento de eliminación de producto a través de Socket.io
        socket.emit("Product Deleted", deletedProduct.productoAEliminar);
      } catch (error) {
        console.error("Error al eliminar el producto:", error.message);
      }
    }
  });

  // Evento para modificar un producto
  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("btn-modify")) {
      const productId = event.target.getAttribute("data-product-id");
      addProdForm.style.display = "inline";
      addProdbtn.style.display = "none";

      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const productData = await response.json();

        // Mostrar los datos del producto en el formulario para editar
        titleInput.value = productData.productoEncontrado.title;
        descriptionInput.value = productData.productoEncontrado.description;
        codeInput.value = productData.productoEncontrado.code;
        priceInput.value = productData.productoEncontrado.price;
        stockInput.value = productData.productoEncontrado.stock;
        categoryInput.value = productData.productoEncontrado.category;

        // Mostrar la URL del thumbnail si está disponible
        if (productData.productoEncontrado.thumbnail) {
          thumbnailPreview.src = productData.productoEncontrado.thumbnail;
        } else {
          thumbnailPreview.src = "./images/no-image.jpg";
        }

        // Establecer el ID del producto en un campo oculto
        productIdInput.value = productId;

        // Cambiar el texto y la funcionalidad del botón de enviar
        submitBtn.innerText = "Actualizar";
        submitBtn.removeEventListener("click", handleSubmit);
        submitBtn.addEventListener("click", handleUpdate);
        resetBtn.style.display = "none";
        tituloHTML.innerHTML = `Modificar el producto con id ${productId}`;
      } catch (error) {
        console.error(
          "Error al obtener los datos del producto:",
          error.message
        );
      }
    }
  });
  // Función handleUpdate, me permite linkear con agregar un producto luego de haberse enviado la edición.
  async function handleUpdate(event) {
    event.preventDefault();

    const formData = new FormData(productForm);
    // Validar el formulario HTML5
    if (!productForm.checkValidity()) {
      productForm.reportValidity();
      return;
    }

    const productId = productIdInput.value;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedProduct = await response.json();

      // Emitir evento de actualización de producto a través de Socket.io
      socket.emit("Product Update", updatedProduct.productoModificado);

      cancelOp();
    } catch (error) {
      console.error("Error al actualizar el producto:", error.message);
    }
  }

  cancel.addEventListener("click", () => cancelOp());

  function cancelOp() {
    productForm.reset();
    // Restaurar el texto y la funcionalidad del botón de enviar
    submitBtn.innerText = "Enviar";
    submitBtn.removeEventListener("click", handleUpdate);
    submitBtn.addEventListener("click", handleSubmit);
    thumbnailPreview.src = "./images/no-image.jpg";
    resetBtn.style.display = "inline";
    tituloHTML.innerHTML = `Añadir un producto`;
    addProdForm.style.display = "none";
    addProdbtn.style.display = "inline";
  }

  //Función para estandarizar la creación o modificación de un producto
  function innerHTMLtext(product) {
    return `
        <p class="flex0">ID: ${product.id}</p>
        <p class="flex1">
          Producto:
          ${product.title}</p>
        <p class="flex2"> Precio: ${product.price} </p>
        <p class="flex3">
          Stock:
          ${product.stock}</p>
        <button
          type="button"
          class="btn-modify flex4"
          data-product-id="${product.id}"
        >Modificar</button>
        <button
          type="button"
          class="btn-delete flex5"
          data-product-id="${product.id}"
        >Eliminar</button>
      `;
  }

  // Evento de vista previa de la imagen
  thumbnailInput.addEventListener("change", function () {
    const file = thumbnailInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        thumbnailPreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      thumbnailPreview.src = "./images/no-image.png";
    }
  });
});
