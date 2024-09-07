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
  