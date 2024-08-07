import express from "express";
import mongoose from "mongoose";
import handlebars from "express-handlebars";
import __dirname from "./utils/utils.js";
import path from "path";
import { Server } from "socket.io";
import viewsRouter from "./router/views.router.js";
import cartRouter from "./router/cart.router.js";
import productsRouter from "./router/products.router.js";

const app = express();
const PORT = 8080;

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DB connection
mongoose
  .connect(
    "mongodb+srv://sofiacermi:BEFinal@beproject.jrrw5gf.mongodb.net/SoGames?retryWrites=true&w=majority&appName=BEProject"
  )
  .then(() => {
    console.log("Conectado a la base de datos");
  })
  .catch((error) =>
    console.error("Error al conectar con la base de datos", error)
  );

//Rutas
app.use("/api/carts", cartRouter);
app.use("/api/products", productsRouter);
app.use("/", viewsRouter);

//Handlebars
// app.engine(
//   "handlebars",
//   handlebars.engine({
//     runtimeOptions: {
//       allowProtoPropertiesByDefault: true,
//     },
//   })
// );

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
