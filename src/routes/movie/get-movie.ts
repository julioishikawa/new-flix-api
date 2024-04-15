import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";
import { getMovieRating } from "../../utils/get-movie-rating";
import { ensureSubscriber } from "../../middlewares/ensureSubscriber";

export async function getMovie(app: FastifyInstance) {
  app.get(
    "/movielist/:movieId",
    { preHandler: ensureSubscriber },
    async (req, reply) => {
      const getMovieParams = z.object({
        movieId: z.string().uuid(),
      });

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
        return reply.status(400).send({ message: "Filme não encontrado" });
      }

      if (!movie.content) {
        return reply.status(404).send({ message: "Conteúdo não encontrado" });
      }

      const content = movie.content;

      // Calcula a porcentagem de rating do filme
      const ratingPercentage = await getMovieRating(movieId);

      return reply.send({
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
    }
  );
}
