import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMovieRating } from "../utils/get-movie-rating";

export async function getMovie(req: Request, res: Response) {
  const getMovieParams = z.object({
    movieId: z.string().uuid(),
  });

  try {
    const { movieId } = getMovieParams.parse(req.params);

    const movie = await prisma.movie.findUnique({
      where: {
        id: movieId,
      },
      include: {
        content: {
          select: {
            id: true,
            URL: true,
          },
        },
      },
    });

    if (!movie) {
      return res.status(400).send({ message: "Filme não encontrado" });
    }

    if (!movie.content) {
      return res.status(404).send({ message: "Conteúdo não encontrado" });
    }

    const content = movie.content;

    // Calcula a porcentagem de rating do filme
    const ratingPercentage = await getMovieRating(movieId);

    return res.send({
      movie: {
        id: movie.id,
        title: movie.title,
        gender: movie.gender,
        date: movie.created_at.toISOString(),
        content: {
          id: content.id,
          URL: content.URL,
        },
        ratingPercentage: `${ratingPercentage}%`, // Inclui a porcentagem de rating na resposta
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar filme:", error.message);
    return res.status(500).send({ message: "Erro ao buscar filme" });
  }
}
