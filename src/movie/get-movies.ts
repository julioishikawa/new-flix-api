import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getMovieRatings } from "../rating/get-movie-rating";
import { getMovieVipVotes } from "../subscriptions/get-movie-vip-vote";

export async function getMovies(req: Request, res: Response) {
  try {
    const { searchText } = req.query;

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
          demo_content: true,
        },
      });

      // Para cada filme, calcule a porcentagem do rating e adicione ao objeto do filme
      for (const movie of movies) {
        // Obtenha a porcentagem do rating para o filme atual
        const ratingPercentage = await getMovieRatings(movie.id);

        // Adicione a porcentagem do rating ao objeto do filme
        (movie as any).rating = ratingPercentage;

        // Obtenha a porcentagem dos votos VIP para o filme atual
        const vipVotesPercentage = await getMovieVipVotes(movie.id);

        // Adicione a porcentagem dos votos VIP ao objeto do filme
        (movie as any).vipVotes = vipVotesPercentage;
      }
    }

    res.send(movies);
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
    res.status(500).send({ message: "Não existem filmes registrados." });
  }
}
