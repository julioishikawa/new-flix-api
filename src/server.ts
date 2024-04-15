require("dotenv").config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { updateUser } from "./routes/user/update-user";
import { loginUser } from "./routes/sessions/login";
import { selectSubscription } from "./routes/subscriptions/select-subscription";
import { uploadImageMovie } from "./routes/movie/upload-image-movie";
import multer from "multer";
import { ensureAuthenticated } from "./middlewares/ensureAuthenticated";
import { ensureAdmin } from "./middlewares/ensureAdmin";

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(cookieParser());
app.use(express.json());

const multerConfig = {
  dest: "uploads/", // Diretório onde os arquivos serão armazenados
  limits: {
    fileSize: 10 * 1024 * 1024, // Limita o tamanho do arquivo para 10MB
  },
};
const upload = multer(multerConfig);

app.post("/login", loginUser);
app.put("/users/:userId", updateUser);
app.post("/select-subscription/:type", ensureAuthenticated, selectSubscription);
app.patch(
  "/newmovie/:movieId",
  ensureAdmin,
  upload.single("image"),
  uploadImageMovie
);

const PORT = parseInt(process.env.SERVER_PORT || "3333", 10);
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
