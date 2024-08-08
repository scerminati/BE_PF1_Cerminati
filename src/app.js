import express from "express";
import mongoose from "mongoose";
import handlebars from "express-handlebars";

import path from "path";
import __dirname from "./utils/utils.js";

import cartRouter from "./router/cart.router.js";
import productsRouter from "./router/products.router.js";
import viewsRouter from "./router/views.router.js";

import { Server } from "socket.io";
import { helpers } from "./utils/utils.js";

const app = express();
const PORT = 8080;

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DB connection
mongoose
  .connect(
    "mongodb+srv://sofiacermi:BEFinal@beproject.jrrw5gf.mongodb.net/SoGamesTest?retryWrites=true&w=majority&appName=BEProject"
  )
  .then(() => {
    console.log("DataBase Connected");
  })
  .catch((error) =>
    console.error("Error al conectar con la base de datos", error)
  );

//Rutas
app.use("/api/carts", cartRouter);
app.use("/api/products", productsRouter);
app.use("/", viewsRouter);

// Crear instancia de Handlebars con helpers personalizados
const hbs = handlebars.create({
  helpers: helpers,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
  },
});

//Handlebars
app.engine("handlebars", hbs.engine);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "handlebars");

//Estáticos
app.use(express.static(path.join(__dirname, "../public")));

//Configuración Socket.io
const httpServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export const socketServer = configureSocketServer(httpServer);

// Lógica de configuración del servidor de Socket.io
function configureSocketServer(httpServer) {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A client connected");

    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });
  });

  return io;
}
