import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { movieVipVotePubSub } from "../utils/vip-vote-pub-sub";

// Definição manual do tipo Rating
interface VIPVote {
  id: string;
  userId: string;
  movieId: string;
  value: number;
  created_at: Date;
}

export async function vipVotingMovie(req: Request, res: Response) {
  const vipVoteMovieBody = z.object({
    value: z.number().int().min(0).max(100),
  });

  const vipVoteMovieParams = z.object({
    movieId: z.string().uuid(),
  });

  try {
    const { movieId } = vipVoteMovieParams.parse(req.params);
    const { value } = vipVoteMovieBody.parse(req.body);

    // Obter userId do usuário autenticado
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).send({ error: "Usuário não autenticado" });
    }

    // Verificar se o usuário já classificou o filme anteriormente
    const userPreviousRating: VIPVote | null = await prisma.vIPVote.findFirst({
      where: {
        AND: [{ userId }, { movieId }],
      },
    });

    if (userPreviousRating) {
      // Se o usuário já classificou o filme, atualize o rating
      await prisma.vIPVote.update({
        where: {
          id: userPreviousRating.id,
        },
        data: {
          value,
        },
      });

      // Publicar nova classificação para o filme
      movieVipVotePubSub.publish(movieId, {
        movieId,
        value,
      });
    } else {
      // Se o usuário não classificou o filme anteriormente, crie um novo rating
      await prisma.vIPVote.create({
        data: {
          userId,
          movieId,
          value,
        },
      });

      // Publicar nova classificação para o filme
      movieVipVotePubSub.publish(movieId, {
        movieId,
        value,
      });
    }

    return res
      .status(201)
      .send({ message: "Classificação feita com sucesso!" });
  } catch (error: any) {
    return res.status(400).send({ error: error.message });
  }
}
