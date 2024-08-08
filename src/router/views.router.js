import express, { text } from "express";
import productsModel from "../models/products.model.js"; // Importar el modelo

const router = express.Router();

// Ruta para renderizar la vista index.handlebars con paginación
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 10 ? 10 : limit;
    const sort = req.query.sort; // Obtén el parámetro de ordenación
    const category = req.query.category; // Obtén el parámetro de categoría

    let filter = {};
    if (category) {
      filter.category = category;
    }

    let sortOrder;
    let result;
    if (sort) {
      sortOrder = sort === "desc" ? -1 : 1;
      result = await productsModel.paginate(filter, {
        page,
        limit,
        sort: { price: sortOrder }, // Ordenar por precio
      });
    } else {
      result = await productsModel.paginate(filter, {
        page,
        limit,
      });
    }

    // Obtener todas las categorías para el filtro
    const allCategories = await productsModel.distinct("category");
    console.log(allCategories);
    console.log(category);

    result.sort = sort;
    result.category = category;
    result.categories = allCategories;
    result.prevLink = result.hasPrevPage
      ? `/?page=${result.prevPage}${limit < 10 ? `&limit=${limit}` : ""}${
          sort ? `&sort=${sort}` : ""
        }${category ? `&category=${category}` : ""}`
      : "";
    result.nextLink = result.hasNextPage
      ? `/?page=${result.nextPage}${limit < 10 ? `&limit=${limit}` : ""}${
          sort ? `&sort=${sort}` : ""
        }${category ? `&category=${category}` : ""}`
      : "";
    result.isValid = !(page <= 0 || page > result.totalPages);

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
      res.render("productDetail", {
        product,
      });
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
