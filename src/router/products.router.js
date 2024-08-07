import express from "express";
import { getNextId, uploader } from "../utils/utils.js";
import productsModel from "../models/products.model.js";
import { socketServer } from "../app.js"; // Importar el servidor de Socket.io

const router = express.Router();

// Middleware para cargar los productos desde el archivo products.json al inicio
// router.use(async (req, res, next) => {
//   try {
//     const loadedProducts = await fileManager("products", false, []);
//     req.products = loadedProducts; // Guardar los productos en el objeto de solicitud
//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ msg: "Error al cargar los productos." });
//   }
// });
router.use(async (req, res, next) => {
  try {
    const loadedProducts = await productsModel.find({}); // Obtener productos desde la base de datos
    req.products = loadedProducts;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al cargar los productos." });
  }
});

// Obtener todos los productos
// router.get("/", (req, res) => {
//   const { products } = req; // Obtener productos del objeto de solicitud
//   let limit = parseInt(req.query.limit);

//   if (!isNaN(limit) && limit > 0) {
//     let productosLimitados = [...products];
//     productosLimitados = productosLimitados.slice(0, limit);
//     res.status(200).json({
//       msg: `Mostrando los primeros ${limit} productos`,
//       productosLimitados,
//     });
//   } else {
//     res.status(200).json({ msg: "Mostrando todos los productos", products });
//   }
// });
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
// router.get("/:pid", (req, res) => {
//   const { products } = req;
//   let idProducto = parseInt(req.params.pid);
//   const productoEncontrado = products.find(
//     (producto) => producto.id === idProducto
//   );
//   productoEncontrado
//     ? res.status(200).json({
//         msg: `Mostrando el producto con id ${idProducto}`,
//         productoEncontrado,
//       })
//     : res.status(404).json({ msg: "No se encuentra el producto con dicho id" });
// });
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
// router.post("/", uploader.single("thumbnail"), (req, res) => {
//   const { products } = req;
//   let { title, description, code, price, stock, category } = req.body;
//   code = parseInt(code);
//   price = parseFloat(price);
//   stock = parseInt(stock);

//   const thumbnail = req.file ? `../images/${req.file.originalname}` : "";
//   console.log(thumbnail);
//   if (
//     (title !== undefined && typeof title !== "string") ||
//     (description !== undefined && typeof description !== "string") ||
//     (code !== undefined && (typeof code !== "number" || code < 1)) ||
//     (price !== undefined && (typeof price !== "number" || price < 1)) ||
//     (stock !== undefined && (typeof stock !== "number" || stock < 0)) ||
//     (category !== undefined && typeof category !== "string")
//   ) {
//     return res.status(400).json({
//       msg: "Falta algún campo obligatorio o alguno de los campos tiene el tipo de dato incorrecto.",
//     });
//   }

//   let status = stock > 0;

//   const newProduct = {
//     id: getNextId(products),
//     title,
//     description,
//     code: parseInt(code),
//     price: parseFloat(price),
//     status,
//     stock: parseInt(stock),
//     category,
//     thumbnail,
//   };
//   console.log(newProduct);
//   let fileStatus;
//   if (thumbnail === "") {
//     fileStatus = "imagen no recibida.";
//   } else {
//     fileStatus = "imagen cargada con éxito.";
//   }
//   console.log(fileStatus);

//   products.push(newProduct);
//   fileManager("products", true, products)
//     .then(() => {
//       // Emitir evento de actualización de producto
//       socketServer.emit("Product Update", newProduct);
//       res.status(201).json({
//         msg: `Producto agregado exitosamente con id ${newProduct.id}, ${fileStatus}`,
//         newProduct,
//       });
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).json({ msg: "Error al guardar el producto." });
//     });
// });
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
// router.put("/:pid", uploader.single("thumbnail"), (req, res) => {
//   const { products } = req;
//   let idProducto = parseInt(req.params.pid);
//   const index = products.findIndex((producto) => producto.id === idProducto);

//   if (index === -1) {
//     return res
//       .status(404)
//       .json({ msg: "No se encuentra el producto con dicho id" });
//   }

//   let { title, description, code, price, stock, category } = req.body;
//   code = parseInt(code);
//   price = parseFloat(price);
//   stock = parseInt(stock);

//   const thumbnail = req.file ? `../images/${req.file.originalname}` : "";
//   console.log(thumbnail);

//   if (
//     (title !== undefined && typeof title !== "string") ||
//     (description !== undefined && typeof description !== "string") ||
//     (code !== undefined && (typeof code !== "number" || code < 1)) ||
//     (price !== undefined && (typeof price !== "number" || price < 1)) ||
//     (stock !== undefined && (typeof stock !== "number" || stock < 0)) ||
//     (category !== undefined && typeof category !== "string")
//   ) {
//     return res.status(400).json({
//       msg: "Falta algún campo obligatorio o alguno de los campos tiene el tipo de dato incorrecto.",
//     });
//   } else {
//     products[index] = {
//       ...products[index],
//       title: title || products[index].title,
//       description: description || products[index].description,
//       code: code || products[index].code,
//       price: price || products[index].price,
//       stock: stock !== undefined ? stock : products[index].stock,
//       status: stock > 0,
//       category: category || products[index].category,
//       thumbnail: thumbnail || products[index].thumbnail,
//     };

//     fileManager("products", true, products)
//       .then(() => {
//         // Emitir evento de actualización de producto
//         socketServer.emit("Product Update", products[index]);
//         res.status(200).json({
//           msg: `Producto modificado correctamente en el id ${idProducto}`,
//           productoModificado: products[index],
//         });
//       })
//       .catch((error) => {
//         console.error(error);
//         res.status(500).json({ msg: "Error al modificar el producto." });
//       });
//   }
// });
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
// router.delete("/:pid", (req, res) => {
//   const { products } = req;
//   let idProducto = parseInt(req.params.pid);
//   const index = products.findIndex((producto) => producto.id === idProducto);

//   if (index === -1) {
//     return res
//       .status(404)
//       .json({ msg: "No se encuentra el producto con dicho id" });
//   }

//   const productoAEliminar = products[index];
//   products.splice(index, 1);

//   fileManager("products", true, products)
//     .then(() => {
//       // Emitir evento de eliminación de producto
//       socketServer.emit("Product Deleted", productoAEliminar);
//       res.status(200).json({
//         msg: `Se elimina el producto con id ${idProducto}`,
//         productoAEliminar,
//       });
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).json({ msg: "Error al eliminar el producto." });
//     });
// });
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
