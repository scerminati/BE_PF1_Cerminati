function tostada(texto) {
  Toastify({
    text: texto,
    duration: 2000,
    gravity: "bottom", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    style: {
      background: "#cc7f53",
      color: "black",
    },
  }).showToast();
}
