import express from "express";
import { getNextIdC } from "../utils/utils.js";
import cartsModel from "../models/carts.model.js";
import productsModel from "../models/products.model.js";
import { socketServer } from "../app.js"; // Importar el servidor de Socket.io

const router = express.Router();

// Función para llenar el carrito con productos
const populateCarrito = async (carrito) => {
  return carrito.populate({
    path: "products.product",
    select: "id title price stock",
  });
};

const emitCarrito = async (carrito) => {
  let carritoEncontrado = await populateCarrito(carrito);
  carritoEncontrado = {
    ...carritoEncontrado.toObject(),
    products: carritoEncontrado.products.map((product) => ({
      ...product.product.toObject(),
      quantity: product.quantity,
    })),
  };
  return carritoEncontrado;
};

// Obtener todos los carritos
router.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit);
    let carts;

    if (!isNaN(limit) && limit > 0) {
      carts = await cartsModel.find({}).limit(limit);
    } else {
      carts = await cartsModel.find({});
    }

    carts = await Promise.all(
      carts.map(async (cart) => {
        let populatedCart = await populateCarrito(cart);
        return {
          ...populatedCart.toObject(),
          products: populatedCart.products.map((product) => ({
            ...product.product.toObject(),
            quantity: product.quantity,
          })),
        };
      })
    );

    res.status(200).json({ msg: "Mostrando carritos", carts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener los carritos." });
  }
});

// Obtener carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    const idCarrito = req.params.cid;
    let carritoEncontrado = await cartsModel.findOne({ _id: idCarrito });

    if (!carritoEncontrado) {
      return res
        .status(404)
        .json({ msg: "No se encuentra el carrito con dicho id" });
    }

    carritoEncontrado = await populateCarrito(carritoEncontrado);
    carritoEncontrado = {
      ...carritoEncontrado.toObject(),
      products: carritoEncontrado.products.map((product) => ({
        ...product.product.toObject(),
        quantity: product.quantity,
      })),
    };

    res.status(200).json({
      msg: `Mostrando carrito con id ${idCarrito}`,
      carritoEncontrado,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener el carrito." });
  }
});

// Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const id = await getNextIdC(cartsModel);
    const newCart = new cartsModel({ id, products: [] });

    await newCart.save();
    res.status(201).json({
      msg: `Nuevo carrito creado exitosamente con el id ${newCart._id}`,
      newCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al crear el carrito." });
  }
});

// Agregar producto a un carrito
router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const idCarrito = req.params.cid;
    const idProducto = req.params.pid;

    const carritoEncontrado = await cartsModel.findOne({ _id: idCarrito });
    if (!carritoEncontrado) {
      return res
        .status(404)
        .json({ msg: `El carrito con id ${idCarrito} no existe.` });
    }

    const productoAAgregar = await productsModel.findOne({ _id: idProducto });
    if (!productoAAgregar) {
      return res
        .status(404)
        .json({ msg: `El producto con id ${idProducto} no existe.` });
    }

    const productoEnCarrito = carritoEncontrado.products.find(
      (product) =>
        product.product.toString() === productoAAgregar._id.toString()
    );

    if (productoEnCarrito && productoAAgregar.stock > 0) {
      productoEnCarrito.quantity++;
    } else if (productoAAgregar.stock > 0) {
      carritoEncontrado.products.push({
        product: productoAAgregar._id,
        quantity: 1,
      });
    } else {
      return res
        .status(404)
        .json({ msg: "No hay más stock de este producto." });
    }

    productoAAgregar.stock--;
    if (productoAAgregar.stock === 0) {
      productoAAgregar.status = false;
    }

    socketServer.emit("Product Update", productoAAgregar);
    await productoAAgregar.save();
    const carritoActualizadoEm = await emitCarrito(carritoEncontrado);
    socketServer.emit("Cart Update", carritoActualizadoEm);
    await carritoEncontrado.save();

    // Volver a cargar el carrito y popular los productos para obtener la respuesta completa
    let carritoActualizado = await cartsModel.findOne({ _id: idCarrito });

    if (carritoActualizado) {
      carritoActualizado = await populateCarrito(carritoActualizado);
      carritoActualizado = {
        ...carritoActualizado.toObject(),
        products: carritoActualizado.products.map((product) => ({
          ...product.product.toObject(),
          quantity: product.quantity,
        })),
      };

      res.status(202).json({
        msg: `El producto ${idProducto} ha sido agregado correctamente al carrito ${idCarrito}`,
        carritoActualizado,
      });
    } else {
      res.status(404).json({ msg: "No se encuentra el carrito con dicho id" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al agregar el producto al carrito." });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const idCarrito = req.params.cid;
    const idProducto = req.params.pid;
    const quantity = parseInt(req.body.quantity); // Asume que quantity se envía en el cuerpo de la solicitud

    if (isNaN(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ msg: "La cantidad debe ser un número positivo." });
    }

    const carritoEncontrado = await cartsModel.findOne({ _id: idCarrito });
    if (!carritoEncontrado) {
      return res
        .status(404)
        .json({ msg: `El carrito con id ${idCarrito} no existe.` });
    }

    const productoAAgregar = await productsModel.findOne({ _id: idProducto });
    if (!productoAAgregar) {
      return res
        .status(404)
        .json({ msg: `El producto con id ${idProducto} no existe.` });
    }

    const productoEnCarrito = carritoEncontrado.products.find(
      (product) =>
        product.product.toString() === productoAAgregar._id.toString()
    );

    if (productoEnCarrito) {
      if (productoAAgregar.stock + productoEnCarrito.quantity >= quantity) {
        let previousQuan = productoEnCarrito.quantity;
        productoEnCarrito.quantity = quantity;
        productoAAgregar.stock =
          previousQuan + productoAAgregar.stock - quantity;
        productoAAgregar.status = productoAAgregar.stock > 0;
      } else {
        return res
          .status(404)
          .json({ msg: "No hay suficiente stock de este producto." });
      }
    } else if (productoAAgregar.stock >= quantity) {
      carritoEncontrado.products.push({
        product: productoAAgregar._id,
        quantity: quantity,
      });
      productoAAgregar.stock -= quantity;
      productoAAgregar.status = productoAAgregar.stock > 0;
    } else {
      return res
        .status(404)
        .json({ msg: "No hay suficiente stock de este producto." });
    }

    // Actualizar el stock del producto

    socketServer.emit("Product Update", productoAAgregar);
    await productoAAgregar.save();
    const carritoActualizadoEm = await emitCarrito(carritoEncontrado);
    socketServer.emit("Cart Update", carritoActualizadoEm);
    await carritoEncontrado.save();

    // Volver a cargar el carrito y popular los productos para obtener la respuesta completa
    let carritoActualizado = await cartsModel.findOne({ _id: idCarrito });
    if (carritoActualizado) {
      carritoActualizado = await populateCarrito(carritoActualizado);
      carritoActualizado = {
        ...carritoActualizado.toObject(),
        products: carritoActualizado.products.map((product) => ({
          ...product.product.toObject(),
          quantity: product.quantity,
        })),
      };

      res.status(202).json({
        msg: `El producto ${idProducto} ha sido agregado correctamente al carrito ${idCarrito}`,
        carritoActualizado,
      });
    } else {
      res.status(404).json({ msg: "No se encuentra el carrito con dicho id" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al agregar el producto al carrito." });
  }
});

// Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  try {
    const idCarrito = req.params.cid;
    let carritoEncontrado = await cartsModel.findOne({ _id: idCarrito });

    if (carritoEncontrado) {
      carritoEncontrado = await populateCarrito(carritoEncontrado);

      // Reajustar el stock de los productos en el carrito
      for (const item of carritoEncontrado.products) {
        let productoEnCarrito = await productsModel.findOne({
          _id: item.product,
        });
        if (productoEnCarrito) {
          productoEnCarrito.stock += item.quantity;
          productoEnCarrito.status = productoEnCarrito.stock > 0;
          socketServer.emit("Product Update", productoEnCarrito);
          await productoEnCarrito.save();
        }
      }

      // Limpiar el carrito
      carritoEncontrado.products = [];
      const carritoActualizadoEm = await emitCarrito(carritoEncontrado);

      socketServer.emit("Cart Update", carritoActualizadoEm);
      await carritoEncontrado.save();

      res.status(200).json({
        msg: `Eliminados todos los productos del carrito con id ${idCarrito}`,
        carritoEncontrado,
      });
    } else {
      res.status(404).json({ msg: "No se encuentra el carrito con dicho id" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al borrar productos del carrito." });
  }
});

// Eliminar un producto en específico
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const idCarrito = req.params.cid;
    const idProduct = req.params.pid;

    // Encontrar el carrito
    let carritoEncontrado = await cartsModel.findOne({ _id: idCarrito });

    if (!carritoEncontrado) {
      return res
        .status(404)
        .json({ msg: "No se encuentra el carrito con dicho id" });
    }

    carritoEncontrado = await populateCarrito(carritoEncontrado);
    console.log(carritoEncontrado);

    // Encontrar el producto a eliminar en el carrito
    let productoEnCarrito = carritoEncontrado.products.find(
      (product) => product.product._id.toString() === idProduct
    );
    console.log(productoEnCarrito);

    if (productoEnCarrito) {
      // Actualizar el stock del producto
      let producto = await productsModel.findOne({ _id: idProduct });
      if (producto) {
        producto.stock += productoEnCarrito.quantity;
        producto.status = producto.stock > 0;
        socketServer.emit("Product Update", producto);
        await producto.save();
      }

      // Filtrar el producto del carrito
      carritoEncontrado.products = carritoEncontrado.products.filter(
        (product) => product.product._id.toString() !== idProduct
      );

      const carritoActualizadoEm = await emitCarrito(carritoEncontrado);

      socketServer.emit("Cart Update", carritoActualizadoEm);
      await carritoEncontrado.save();

      res.status(200).json({
        msg: `Producto con id ${idProduct} eliminado del carrito con id ${idCarrito}`,
        carritoEncontrado,
      });
    } else {
      res.status(404).json({ msg: "El producto no está en el carrito." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al eliminar el producto del carrito." });
  }
});

export default router;
