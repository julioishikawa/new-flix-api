import { Request, Response, Router } from "express";
import multer, { StorageEngine } from "multer";
import { DiskStorage } from "../../providers/diskStorage";
import { ensureAdmin } from "../../middlewares/ensureAdmin";

const uploadConfig = require("../../configs/upload");

const app = Router();
const upload = multer(uploadConfig);

export async function uploadImageMovie() {
  // Definir a rota para lidar com o upload de imagens do filme
  app.patch(
    "/newmovie/:movieId",
    ensureAdmin,
    upload.single("image"),
    async (request: Request, response: Response) => {
      try {
        console.log("Request body:", request.body);
        console.log("Request file:", (request as any).file);

        // Verifica se o arquivo foi enviado
        const file = (request as any).file;
        if (!file) {
          return response
            .status(400)
            .send({ message: "Nenhuma imagem enviada" });
        }

        // Renomeia o arquivo para incluir o ID do filme no nome
        const diskStorage = new DiskStorage();
        const fileName = await diskStorage.saveFile(file.filename); // Corrigindo número de argumentos

        response.send({
          filename: fileName, // Se desejar, você pode enviar o nome do arquivo de volta
        });
      } catch (error) {
        console.error("Erro ao enviar a imagem:", error);
        response.status(500).send({
          message: "Erro interno do servidor ao processar o upload de imagem",
        });
      }
    }
  );

  return app;
}

export default app;
