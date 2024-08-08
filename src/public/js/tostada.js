//Tostify alerts para todo el proyecto, se carga en main.handlebars.

function tostada(texto) {
  Toastify({
    text: texto,
    duration: 2000,
    gravity: "bottom", 
    position: "right", 
    style: {
      background: "#cc7f53",
      color: "black",
    },
  }).showToast();
}
