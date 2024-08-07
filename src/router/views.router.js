import express, { text } from "express";
import productsModel from "../models/products.model.js"; // Importar el modelo

const router = express.Router();

// Ruta para renderizar la vista index.handlebars con paginación
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit > 10 && 10;

    let textLimit;
    if (limit == 10) {
      textLimit = "";
    } else {
      textLimit = `&limit=${limit}`;
    }
    console.log(textLimit);

    const result = await productsModel.paginate({}, { page, limit });
    result.prevLink = result.hasPrevPage
      ? `/?page=${result.prevPage}${textLimit}`
      : "";
    result.nextLink = result.hasNextPage
      ? `/?page=${result.nextPage}${textLimit}`
      : "";
    result.isValid = !(page <= 0 || page > result.totalPages);
    console.log(result);
    res.render("index", result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al cargar los productos." });
  }
});

// Ruta para mostrar los detalles de un producto
router.get("/products/:pid", async (req, res) => {
  try {
    const idProduct = req.params.pid;
    const product = await productsModel.findOne({ _id: idProduct });

    if (product) {
      res.render("productDetail", { product });
    } else {
      res.status(404).json({ msg: "Producto no encontrado." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener el producto." });
  }
});

router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productsModel.find({}); // Cargar todos los productos desde la base de datos
    res.render("realtimeproducts", {
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al cargar los productos." });
  }
});

export default router;
