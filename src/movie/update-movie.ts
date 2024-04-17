import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function updateMovie(req: Request, res: Response) {
  const updateMovieParams = z.object({
    movieId: z.string().uuid(),
  });

  const { movieId } = updateMovieParams.parse(req.params);

  const updateMovieBody = z.object({
    title: z.string().optional(),
    image: z.any().optional(),
    gender: z.string().optional(),
    description: z.string().optional(),
    content: z.object({
      URL: z.string().optional(),
    }),
  });

  try {
    const { title, image, gender, description, content } =
      updateMovieBody.parse(req.body);

    const existingMovie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!existingMovie) {
      return res.status(404).send({ error: "Filme não encontrado" });
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
        image,
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
