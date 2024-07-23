import express from "express";
import { fileManager } from "../utils/utils.js";

const router = express.Router();

// Middleware para cargar los productos desde el archivo products.json al inicio
router.use(async (req, res, next) => {
  try {
    const loadedProducts = await fileManager("products", false, []);
    req.products = loadedProducts; // Guardar los productos en el objeto de solicitud
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al cargar los productos." });
  }
});

// Ruta para renderizar la vista index.handlebars
router.get("/", (req, res) => {
  res.render("index", {
    products: req.products,
  });
});

router.get("/realtimeproducts", (req, res) => {

  res.render("realtimeproducts", {
    products: req.products, 
  });
});

export default router;
