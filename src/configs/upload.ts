import fastifyMulter from "fastify-multer";
import crypto from "crypto";
import path from "path";

const TMP_FOLDER = path.resolve(__dirname, "..", "..", "tmp");
const UPLOADS_FOLDER = path.resolve(TMP_FOLDER, "uploads");

// Configuração do fastify-multer
const storage = fastifyMulter.diskStorage({
  destination: TMP_FOLDER,
  filename(req, file, cb) {
    const fileHash = crypto.randomBytes(10).toString("hex");
    const fileName = `${fileHash}-${file.originalname}`;
    cb(null, fileName);
  },
});

const MULTER = fastifyMulter({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
}).single("image");

export { MULTER, TMP_FOLDER, UPLOADS_FOLDER };
