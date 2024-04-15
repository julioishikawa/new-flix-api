import { Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { ensureSubscriber } from "../../middlewares/ensureSubscriber";

const app = Router();

app.get("/movielist", ensureSubscriber, async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        content: true,
      },
    });

    res.send(movies);
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
    res.status(500).send({ message: "Não existem filmes registrados." });
  }
});

export default app;
