import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { FastifyInstance, FastifyRequest } from "fastify";
import { movieRatingPubSub } from "../../utils/rating-pub-sub";
import { ensureSubscriber } from "../../middlewares/ensureSubscriber";

// Definição manual do tipo Rating
interface Rating {
  id: string;
  userId: string;
  movieId: string;
  rating: number | null; // Agora o rating é opcional
  created_at: Date;
}

export async function rateMovie(app: FastifyInstance) {
  app.post(
    "/movielist/:movieId/ratings",
    { preHandler: ensureSubscriber },
    async (req: FastifyRequest, reply) => {
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
          return reply.status(401).send({ error: "Usuário não autenticado" });
        }

        // Verificar se o usuário já classificou o filme anteriormente
        const userPreviousRating: Rating | null = await prisma.rating.findFirst(
          {
            where: {
              AND: [{ userId }, { movieId }],
            },
          }
        );

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

        return reply
          .status(201)
          .send({ message: "Classificação feita com sucesso!" });
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );
}
