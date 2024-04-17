import path from "path";
import multer from "multer";
import crypto from "crypto";

const TMP_FOLDER = path.resolve(__dirname, "..", "..", "tmp");
const UPLOADS_FOLDER = path.resolve(TMP_FOLDER, "uploads");

function configureMulter() {
  const storage = multer.diskStorage({
    destination: TMP_FOLDER,
    filename(req, file, cb) {
      const fileHash = crypto.randomBytes(10).toString("hex");
      const fileName = `${fileHash}-${file.originalname}`;
      return cb(null, fileName);
    },
  });

  return {
    storage,
    TMP_FOLDER,
    UPLOADS_FOLDER,
  };
}

export { configureMulter, TMP_FOLDER, UPLOADS_FOLDER };
