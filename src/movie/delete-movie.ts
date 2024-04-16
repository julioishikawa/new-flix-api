import z from "zod";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { ensureAdmin } from "../middlewares/ensureAdmin";

const app = Router();

app.delete("/movielist/:movieId", ensureAdmin, async (req, res) => {
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
      return res.status(404).send({ error: "Filme não encontrado" });
    }

    await prisma.movieContent.deleteMany({
      where: { movieId: movieId },
    });

    await prisma.movie.delete({
      where: { id: movieId },
    });

    return res.status(200).send({ message: "Filme deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir filme:", error);
    return res.status(500).send({ error: "Erro interno do servidor" });
  }
});

export default app;
