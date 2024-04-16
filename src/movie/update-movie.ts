import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { DiskStorage } from "../providers/diskStorage";
import { ensureAdmin } from "../middlewares/ensureAdmin";

interface UpdateMovieRequest {
  title?: string;
  image?: any;
  gender?: string;
  description?: string;
  content?: {
    URL?: string;
  };
}

const app = Router();

app.put(
  "/editmovie/:movieId",
  ensureAdmin,
  async (req: Request, res: Response) => {
    const updateMovieParams = z.object({
      movieId: z.string().uuid(),
    });

    const { movieId } = updateMovieParams.parse(req.params);

    const updateMovieBody = z.object({
      title: z.string().optional(),
      image: z.any().optional(),
      gender: z.string().optional(),
      description: z.string().optional(),
      content: z
        .object({
          URL: z.string().optional(),
        })
        .passthrough(),
    });

    try {
      const requestBody = req.body as UpdateMovieRequest;
      const { title, image, gender, description, content } =
        updateMovieBody.parse(req.body);

      const allowedProperties = [
        "title",
        "image",
        "gender",
        "description",
        "content",
      ];
      const unexpectedProperties = Object.keys(requestBody).filter(
        (key) => !allowedProperties.includes(key)
      );

      const contentAllowedProperties = ["URL"];
      const contentUnexpectedProperties = Object.keys(content).filter(
        (key) => !contentAllowedProperties.includes(key)
      );

      if (
        unexpectedProperties.length > 0 ||
        contentUnexpectedProperties.length > 0
      ) {
        return res.status(400).send({
          error:
            "Propriedades adicionais no objeto 'movie' ou 'content' não são permitidas",
          unexpectedProperties,
          unexpectedContentProperties: contentUnexpectedProperties,
        });
      }

      const existingMovie = await prisma.movie.findUnique({
        where: { id: movieId },
      });

      if (!existingMovie) {
        return res.status(404).send({ error: "Filme não encontrado" });
      }

      // Se uma nova imagem for fornecida, salve-a
      if (image) {
        const diskMovieStorage = new DiskStorage();
        const savedImage = await diskMovieStorage.saveFile(image);

        // Exclua a imagem anterior, se existir
        if (existingMovie.image) {
          await diskMovieStorage.deleteFile(existingMovie.image);
        }

        // Atualize o nome da imagem no objeto de filme existente
        existingMovie.image = savedImage;
      }

      // Atualize os detalhes do filme no banco de dados
      const updatedMovie = await prisma.movie.update({
        where: { id: movieId },
        include: {
          content: {
            select: {
              id: true,
              URL: true,
            },
          },
        },
        data: {
          title,
          // Atualize a imagem somente se for fornecida e atualizada
          image: image || existingMovie.image,
          gender,
          description,
          content: {
            update: {
              URL: content?.URL,
            },
          },
          updated_at: new Date(),
        },
      });

      return res.status(200).send(updatedMovie);
    } catch (error) {
      console.error("Erro ao atualizar o filme:", error);
      return res.status(500).send({ error: "Erro interno do servidor" });
    }
  }
);

export default app;
