import z from "zod";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";
import { ensureAdmin } from "../../middlewares/ensureAdmin";

export async function deleteMovie(app: FastifyInstance) {
  app.delete(
    "/movielist/:movieId",
    { preHandler: ensureAdmin },
    async (req, reply) => {
      const getMovieParams = z.object({
        movieId: z.string().uuid(),
      });

      const { movieId } = getMovieParams.parse(req.params);

      try {
        const existingMovie = await prisma.movie.findUnique({
          where: { id: movieId },
          include: { content: true },
        });

        if (!existingMovie) {
          return reply.status(404).send({ error: "Filme não encontrado" });
        }

        await prisma.movieContent.deleteMany({
          where: { movieId: movieId },
        });

        await prisma.movie.delete({
          where: { id: movieId },
        });

        return reply
          .status(200)
          .send({ message: "Filme deletado com sucesso!" });
      } catch (error) {
        console.error("Erro ao excluir filme:", error);
        return reply.status(500).send({ error: "Erro interno do servidor" });
      }
    }
  );
}
