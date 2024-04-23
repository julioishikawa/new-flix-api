import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function newMovie(req: Request, res: Response) {
  const createMovieBody = z.object({
    title: z.string(),
    genres: z.array(z.string()),
    description: z.string(),
    content: z.object({
      URL: z.string(),
    }),
  });

  const validGenres = [
    "Ação",
    "Comédia",
    "Drama",
    "Ficção Científica",
    "Suspense",
    "Terror",
  ];

  try {
    const requestBody = req.body;

    const { title, genres, description, content } =
      createMovieBody.parse(requestBody);

    // Verificar se todos os gêneros fornecidos são válidos
    for (const genre of genres) {
      if (!validGenres.includes(genre)) {
        throw new Error(`Gênero do filme inválido: ${genre}`);
      }
    }

    const image = "default.jpg";

    const movie = await prisma.movie.create({
      data: {
        title,
        image: image,
        genres,
        description,
        content: {
          create: {
            URL: content.URL,
          },
        },
      },
    });

    return res.status(201).send({ movieId: movie.id });
  } catch (error: any) {
    console.error("Error creating movie:", error.message);
    return res.status(400).send({ error: error.message });
  }
}
