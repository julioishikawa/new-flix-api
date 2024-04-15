import { Request, Response, Router } from "express";
import { z } from "zod";
import { ensureAdmin } from "../../middlewares/ensureAdmin";
import { DiskStorage } from "../../providers/diskStorage";
import { prisma } from "../../lib/prisma";

const uploadConfig = require("../configs/upload");

const app = Router();

app.post(
  "/newmovie",
  ensureAdmin,
  uploadConfig.single("image"),
  async (req: Request, res: Response) => {
    console.log("Received request to create a new movie...");

    const createMovieBody = z.object({
      title: z.string(),
      gender: z.string(),
      description: z.string(),
      content: z.object({
        URL: z.string(),
      }),
      image: z.string(), // Adicionando a validação do campo image
    });

    try {
      console.log("Parsing request body...");
      const requestBody = req.body;

      const { title, gender, description, content } =
        createMovieBody.parse(requestBody);

      // Acesso à imagem enviada pelo middleware MULTER
      console.log("Accessing uploaded image...");
      const imageUpload: any = req.file;

      if (!imageUpload) {
        console.log("No image uploaded, returning error...");
        return res
          .status(400)
          .send({ error: "O campo de imagem é obrigatório" });
      }

      // Criar uma instância de DiskStorage
      console.log("Creating DiskStorage instance...");
      const diskStorage = new DiskStorage();

      // Salvar a imagem no disco e obter o nome do arquivo retornado
      console.log("Saving image to disk...");
      const imageFileName = await diskStorage.saveFile(imageUpload.filename);

      // Criar o filme no banco de dados usando o nome do arquivo da imagem
      console.log("Creating movie in database...");
      const movie = await prisma.movie.create({
        data: {
          title,
          image: imageFileName,
          gender,
          description,
          content: {
            create: {
              URL: content.URL,
            },
          },
        },
      });

      console.log("Movie created successfully!");
      return res.status(201).send({ movieId: movie.id });
    } catch (error: any) {
      console.error("Error creating movie:", error.message);
      return res.status(400).send({ error: error.message });
    }
  }
);

export default app;
