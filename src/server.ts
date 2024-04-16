require("dotenv").config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { routes } from "./routes";

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(cookieParser());
app.use(express.json());

// const multerConfig = {
//   dest: "uploads/", // Diretório onde os arquivos serão armazenados
//   limits: {
//     fileSize: 10 * 1024 * 1024, // Limita o tamanho do arquivo para 10MB
//   },
// };
// const upload = multer(multerConfig);

app.use(routes);

const PORT = parseInt(process.env.SERVER_PORT || "3333", 10);
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
