import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { movieRatingPubSub } from "../utils/rating-pub-sub";

// Definição manual do tipo Rating
interface Rating {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  created_at: Date;
}

export async function ratingMovie(req: Request, res: Response) {
  const rateMovieBody = z.object({
    rating: z.number().int().min(0).max(100),
  });

  const rateMovieParams = z.object({
    movieId: z.string().uuid(),
  });

  try {
    const { movieId } = rateMovieParams.parse(req.params);
    const { rating } = rateMovieBody.parse(req.body);

    // Obter userId do usuário autenticado
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).send({ error: "Usuário não autenticado" });
    }

    // Verificar se o usuário já classificou o filme anteriormente
    const userPreviousRating: Rating | null = await prisma.rating.findFirst({
      where: {
        AND: [{ userId }, { movieId }],
      },
    });

    if (userPreviousRating) {
      // Se o usuário já classificou o filme, atualize o rating
      await prisma.rating.update({
        where: {
          id: userPreviousRating.id,
        },
        data: {
          rating,
        },
      });

      // Publicar nova classificação para o filme
      movieRatingPubSub.publish(movieId, {
        movieId,
        rating,
      });
    } else {
      // Se o usuário não classificou o filme anteriormente, crie um novo rating
      await prisma.rating.create({
        data: {
          userId,
          movieId,
          rating,
        },
      });

      // Publicar nova classificação para o filme
      movieRatingPubSub.publish(movieId, {
        movieId,
        rating,
      });
    }

    return res
      .status(201)
      .send({ message: "Classificação feita com sucesso!" });
  } catch (error: any) {
    return res.status(400).send({ error: error.message });
  }
}
