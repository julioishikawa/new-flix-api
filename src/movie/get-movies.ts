import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getMovies(req: Request, res: Response) {
  try {
    const { searchText } = req.query; // Obtém o parâmetro de consulta searchText

    let movies;
    if (searchText) {
      // Se searchText estiver presente, filtra os filmes pelo título
      movies = await prisma.movie.findMany({
        where: {
          title: {
            contains: searchText.toString(), // Filtra os filmes cujo título contenha searchText
            mode: "insensitive", // Faz a busca sem diferenciar maiúsculas e minúsculas
          },
        },
        include: {
          content: true,
        },
      });
    } else {
      // Se searchText não estiver presente, retorna todos os filmes
      movies = await prisma.movie.findMany({
        include: {
          content: true,
        },
      });
    }

    res.send(movies);
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
    res.status(500).send({ message: "Não existem filmes registrados." });
  }
}
