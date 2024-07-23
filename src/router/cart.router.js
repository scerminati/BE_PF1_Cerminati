import express from "express";
import { fileManager, getNextId } from "../utils/utils.js";

const router = express.Router();

let carts = [];

// Middleware para cargar los carritos desde el archivo carts.json al inicio
router.use(async (req, res, next) => {
  try {
    carts = await fileManager("carts", false, []);
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al cargar los carritos." });
  }
});

// Obtener todos los carritos
router.get("/", (req, res) => {
  let limit = parseInt(req.query.limit);

  if (!isNaN(limit) && limit > 0) {
    let carritosLimitados = [...carts];
    carritosLimitados = carritosLimitados.slice(0, limit);
    res
      .status(200)
      .json({ msg: `Mostrando ${limit} carritos`, carritosLimitados });
  } else {
    res.status(200).json({ msg: "Mostrando todos los carritos", carts });
  }
});

// Obtener carrito por ID
router.get("/:cid", (req, res) => {
  let idCarrito = parseInt(req.params.cid);
  const carritoEncontrado = carts.find((cart) => cart.id === idCarrito);
  carritoEncontrado
    ? res.status(200).json({
        msg: `Mostrando carrito con id ${idCarrito}`,
        carritoEncontrado,
      })
    : res.status(404).json({ msg: "No se encuentra el carrito con dicho id" });
});

// Crear un nuevo carrito
router.post("/", (req, res) => {
  const id = getNextId(carts);
  carts.push({ id, products: [] });
  fileManager("carts", true, carts)
    .then(() => {
      res
        .status(201)
        .json({ msg: `Nuevo carrito creado exitosamente con el id ${id}` });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ msg: "Error al crear el carrito." });
    });
});

// Agregar producto a un carrito
router.put("/:cid/product/:pid", async (req, res) => {
  let products = await fileManager("products", false, []);
  let idCarrito = parseInt(req.params.cid);
  let idProducto = parseInt(req.params.pid);

  const carritoEncontrado = carts.find((carrito) => carrito.id === idCarrito);
  if (!carritoEncontrado) {
    return res
      .status(404)
      .json({ msg: `El carrito con id ${idCarrito} no existe.` });
  }

  const productoAAgregar = products.find(
    (product) => product.id === idProducto
  );
  if (!productoAAgregar) {
    return res
      .status(404)
      .json({ msg: `El producto con id ${idProducto} no existe.` });
  }

  const index = carts.findIndex((carrito) => carrito.id === idCarrito);
  let productoCartIndex = carts[index].products.findIndex(
    (product) => product.id === idProducto
  );

  if (productoCartIndex !== -1 && productoAAgregar.stock > 0) {
    carts[index].products[productoCartIndex].quantity++;
  } else if (productoAAgregar.stock > 0) {
    carts[index].products.push({ id: productoAAgregar.id, quantity: 1 });
    productoCartIndex = carts[index].products.findIndex(
      (product) => product.id === idProducto
    );
  } else {
    return res.status(404).json({ msg: "No hay más stock de este producto." });
  }

  productoAAgregar.stock--;
  productoAAgregar.status = productoAAgregar.stock > 0;

  await fileManager("products", true, products);
  await fileManager("carts", true, carts);

  const objetoCart = carts[index];
  res.status(202).json({
    msg: `El producto ${idProducto} ha sido agregado correctamente al carrito ${idCarrito}, la cantidad actual es ${carts[index].products[productoCartIndex].quantity}`,
    objetoCart,
  });
});

export default router;
