const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const VIDEO_EXTENTIONS = ["mp3", "ogg"];
const IMAGE_EXTENTIONS = ["jpg", "jpeg", "png", "gif"];
const ALLOWED_EXTENTIONS = [...VIDEO_EXTENTIONS, ...IMAGE_EXTENTIONS];

const getMediaType = (ext) => {
  if (!ALLOWED_EXTENTIONS.includes(ext)) {
    throw new Error("Extensión no soportada");
  }

  return VIDEO_EXTENTIONS.includes(ext) ? "video" : "image";
};

class MediaController {
  async save(req, res) {
    try {
      const form = new formidable.IncomingForm();

      // Directorio en el directorio raíz donde se guardarán las imágenes
      const uploadDir = path.join(__dirname, "../../uploads");

      // Verificar si el directorio de carga existe, si no, crearlo
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      form.uploadDir = uploadDir;

      const files = [];

      form
        .on("file", function (field, file) {
          files.push(file);
        })
        .on("end", function () {
          for (let index = 0; index < files.length; index++) {
            const file = files[index];

            const name = uuidv4();
            const extension = file.originalFilename
              .replace(/\?.*$/, "")
              .split(".")
              .pop()
              .toLowerCase();

            if (!ALLOWED_EXTENTIONS.includes(extension)) {
              res.status(400);
              return res.json({
                msg:
                  "Las extensiones de archivo soportadas son " +
                  ALLOWED_EXTENTIONS.join(", "),
              });
            }

            const newName = path.join(uploadDir, name + "." + extension);
            const relativePath = "/uploads" + "/" + name + "." + extension;
            const completePath = path.resolve(
              __dirname,
              "..",
              "..",
              "uploads",
              name + "." + extension
            );
            const baseURL = path.resolve(__dirname, "..", "..");

            fs.rename(file.filepath, newName, function (err) {
              if (err) {
                console.error(err);
                res.status(400);
                res.json({ msg: "NO se guardó!!" });
              } else {
                res.status(200);
                res.json({
                  msg: "Se guardó el archivo con éxito",
                  data: {
                    relativePath,
                    completeURL: completePath,
                    baseURL,
                    type: getMediaType(extension),
                  },
                });
              }
            });
          }
        });

      form.parse(req);
    } catch (error) {
      console.error(error);

      res.status(500).json({ msg: "Algo salió mal" });
    }
  }
}

module.exports = MediaController;
