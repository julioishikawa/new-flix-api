import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { ensureSubscriber } from "../../middlewares/ensureSubscriber";

export async function getMovies(app: FastifyInstance) {
  app.get(
    "/movielist",
    { preHandler: ensureSubscriber },
    async (req, reply) => {
      try {
        const movies = await prisma.movie.findMany({
          include: {
            content: true,
          },
        });

        reply.send(movies);
      } catch (error) {
        console.error("Erro ao buscar filmes:", error);
        reply.status(500).send({ message: "Não existem filmes registrados." });
      }
    }
  );
}
