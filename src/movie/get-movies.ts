import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getMovies(req: Request, res: Response) {
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
}
