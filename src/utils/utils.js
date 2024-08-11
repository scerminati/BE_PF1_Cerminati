//__dirname
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

//getNextId para productos
import productsModel from "../models/products.model.js"; // Ajusta la ruta según la ubicación de tu modelo

export async function getNextId() {
  try {
    const lastProduct = await productsModel.findOne(
      {},
      {},
      { sort: { id: -1 } }
    );
    return lastProduct ? lastProduct.id + 1 : 1;
  } catch (error) {
    console.error("Error al obtener el siguiente ID:", error);
    throw error;
  }
}

import cartsModel from "../models/carts.model.js"; // Ajusta la ruta según la ubicación de tu modelo

//getNextId para carrito
export async function getNextIdC() {
  try {
    const lastCart = await cartsModel.findOne({}, {}, { sort: { id: -1 } });
    return lastCart ? lastCart.id + 1 : 1;
  } catch (error) {
    console.error("Error al obtener el siguiente ID:", error);
    throw error;
  }
}

//multer
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Validar que el archivo sea una imagen
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error("Tipo de archivo no permitido. Solo se permiten imágenes."),
      false
    );
  }
};

export const uploader = multer({
  storage: storage,
  fileFilter: fileFilter,
});

//Helpers en handlebars
export const helpers = {
  eq: (a, b) => a == b,
  add: (a, b) => a + b,
};
