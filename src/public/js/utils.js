//Scripts globales, se carga en main.handlebars.

// Conectar al servidor de Socket.io
const socket = io();

// Escuchar eventos de conexión y desconexión
socket.on("connect", () => {
  console.log("Cliente conectado al servidor");
});

socket.on("disconnect", () => {
  console.log("Cliente desconectado del servidor");
});

//Alertas por tostadas
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
  