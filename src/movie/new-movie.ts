import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

interface NewMovieRequest {
  title: string;
  genres: string[];
  description: string;
  demo_content: {
    trailer_URL: string;
  };
  content: {
    URL: string;
  };
}

export async function newMovie(req: Request, res: Response) {
  const createMovieBody = z.object({
    title: z.string(),
    genres: z.array(z.string()),
    description: z.string(),
    demo_content: z.object({
      trailer_URL: z.string(),
    }),
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
    const requestBody = req.body as NewMovieRequest;

    // Verificar se todos os campos obrigatórios estão presentes
    const { title, genres, description, demo_content, content } =
      createMovieBody.parse(requestBody);

    if (!title || !description || !demo_content.trailer_URL || !content.URL) {
      throw new Error("Todos os campos devem ser preenchidos.");
    }

    if (!genres || genres.length === 0) {
      throw new Error(
        "Você precisa escolher pelo menos 1 gênero para o filme."
      );
    }

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
        demo_content: {
          create: {
            trailer_URL: demo_content.trailer_URL,
          },
        },
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
