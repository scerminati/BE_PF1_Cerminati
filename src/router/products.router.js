import express from "express";

import productsModel from "../models/products.model.js";

import { getNextId, uploader } from "../utils/utils.js";
import { socketServer } from "../app.js";

const router = express.Router();

// Middleware para cargar los productos desde el modelo
router.use(async (req, res, next) => {
  try {
    const loadedProducts = await productsModel.find({});
    req.products = loadedProducts;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al cargar los productos." });
  }
});

// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const products = await productsModel.find({});
    let limit = parseInt(req.query.limit);

    if (!isNaN(limit) && limit > 0) {
      let productosLimitados = products.slice(0, limit);
      res.status(200).json({
        msg: `Mostrando los primeros ${limit} productos`,
        productosLimitados,
      });
    } else {
      res.status(200).json({ msg: "Mostrando todos los productos", products });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener los productos." });
  }
});

// Obtener producto por ID
router.get("/:pid", async (req, res) => {
  try {
    const idProducto = req.params.pid;
    const productoEncontrado = await productsModel.findOne({ id: idProducto });

    if (productoEncontrado) {
      res.status(200).json({
        msg: `Mostrando el producto con id ${idProducto}`,
        productoEncontrado,
      });
    } else {
      res.status(404).json({ msg: "No se encuentra el producto con dicho id" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener el producto." });
  }
});

// Agregar un nuevo producto
router.post("/", uploader.single("thumbnail"), async (req, res) => {
  try {
    let { title, description, code, price, stock, category } = req.body;
    code = parseInt(code);
    price = parseFloat(price);
    stock = parseInt(stock);

    const thumbnail = req.file ? `../images/${req.file.originalname}` : "";

    if (
      (title !== undefined && typeof title !== "string") ||
      (description !== undefined && typeof description !== "string") ||
      (code !== undefined && (typeof code !== "number" || code < 1)) ||
      (price !== undefined && (typeof price !== "number" || price < 1)) ||
      (stock !== undefined && (typeof stock !== "number" || stock < 0)) ||
      (category !== undefined && typeof category !== "string")
    ) {
      return res.status(400).json({
        msg: "Falta algún campo obligatorio o alguno de los campos tiene el tipo de dato incorrecto.",
      });
    }

    let status = stock > 0;

    const newProduct = new productsModel({
      id: await getNextId(productsModel),
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnail,
    });

    await newProduct.save();

    socketServer.emit("Product Update", newProduct);
    res.status(201).json({
      msg: `Producto agregado exitosamente con id ${newProduct.id}`,
      newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al guardar el producto." });
  }
});


// Modificar un producto por ID
router.put("/:pid", uploader.single("thumbnail"), async (req, res) => {
  try {
    const idProducto = req.params.pid;
    const { title, description, code, price, stock, category } = req.body;

    const thumbnail = req.file ? `../images/${req.file.originalname}` : "";

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(code && { code: parseInt(code) }),
      ...(price && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      status: stock > 0,
      ...(category && { category }),
      ...(thumbnail && { thumbnail }),
    };

    const updatedProduct = await productsModel.findOneAndUpdate(
      { id: idProducto },
      updateData,
      { new: true }
    );

    if (updatedProduct) {
      socketServer.emit("Product Update", updatedProduct);
      res.status(200).json({
        msg: `Producto modificado correctamente en el id ${idProducto}`,
        productoModificado: updatedProduct,
      });
    } else {
      res.status(404).json({ msg: "No se encuentra el producto con dicho id" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al modificar el producto." });
  }
});


// Eliminar un producto por ID
router.delete("/:pid", async (req, res) => {
  try {
    const idProducto = req.params.pid;
    const deletedProduct = await productsModel.findOneAndDelete({ id: idProducto });

    if (deletedProduct) {
      socketServer.emit("Product Deleted", deletedProduct);
      res.status(200).json({
        msg: `Se eliminó el producto con id ${idProducto}`,
        productoAEliminar: deletedProduct,
      });
    } else {
      res.status(404).json({ msg: "No se encuentra el producto con dicho id" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar el producto." });
  }
});


export default router;
