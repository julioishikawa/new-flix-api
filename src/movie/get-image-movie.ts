import { Request, Response, Router } from "express";
import { UPLOADS_FOLDER } from "../configs/upload";
import path from "path";
import fs from "fs";

const app = Router();

app.get("/get-image/:filename", async (req: Request, res: Response) => {
  try {
    const { filename } = req.params as { filename: string };

    // Verificar se o arquivo existe no diretório de uploads
    const filePath = path.join(UPLOADS_FOLDER, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error("Image not found");
    }

    // Ler o conteúdo do arquivo
    const fileContent = fs.readFileSync(filePath);

    // Definir o tipo de conteúdo da resposta como image/jpeg
    res.setHeader("Content-Type", "image/jpeg");

    // Retornar o conteúdo do arquivo como resposta
    return res.send(fileContent);
  } catch (error: any) {
    // Em caso de erro, retornar uma resposta de erro com o status 404 Not Found
    return res.status(404).send({ error: error.message });
  }
});

export default app;
