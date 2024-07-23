import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const fileManager = async (fileName, save, array) => {
  let path;
  let data;

  if (fileName === "products") {
    path = "src/json/products.json";
  } else if (fileName === "carts") {
    path = "src/json/carts.json";
  }

  if (save) {
    try {
      await fs.promises.writeFile(path, JSON.stringify(array, null, 2));
      console.log(`Archivo ${fileName}.json guardado correctamente.`);
    } catch (error) {
      console.error(error, `No se pudo guardar el archivo ${fileName}.json.`);
    }
  } else {
    try {
      const fileContent = await fs.promises.readFile(path, "utf8");

      data = JSON.parse(fileContent);
      return data;
    } catch (error) {
      console.error(error, `No se pudo leer el archivo ${fileName}.json.`);
      try {
        await fs.promises.writeFile(path, JSON.stringify([], null, 2));
        console.log(
          `Archivo ${fileName}.json creado correctamente con un array vacío.`
        );
      } catch (error) {
        console.error(error, `No se pudo crear el archivo ${fileName}.json.`);
      }
    }
  }
};

export function getNextId(array) {
  if (array.length === 0) {
    return 1;
  } else {
    const largo = array.length;
    const ultimoId = Math.max(...array.map((ult) => ult.id));
    const maxId = largo >= ultimoId ? largo : ultimoId;

    return maxId + 1;
  }
}

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
