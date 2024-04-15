import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ensureAdmin } from "../../middlewares/ensureAdmin";
import { MULTER } from "../../configs/upload";
import DiskStorage from "../../providers/diskStorage";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

interface NewMovieRequest {
  title: string;
  image: string;
  gender: string;
  description: string;
  content: {
    URL: string;
  };
}

export async function newMovie(app: FastifyInstance) {
  app.post<{ Body: NewMovieRequest }>(
    "/newmovie",
    { preHandler: ensureAdmin },
    async (
      req: FastifyRequest<{ Body: NewMovieRequest }>,
      reply: FastifyReply
    ) => {
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
        const imageUpload: any = (req as any).file;

        if (!imageUpload) {
          console.log("No image uploaded, returning error...");
          return reply
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
        return reply.status(201).send({ movieId: movie.id });
      } catch (error: any) {
        console.error("Error creating movie:", error.message);
        return reply.status(400).send({ error: error.message });
      }
    }
  );
}
