import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

interface UpdateMovieRequest {
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

export async function updateMovie(req: Request, res: Response) {
  const updateMovieParams = z.object({
    movieId: z.string().uuid(),
  });

  const updateMovieBody = z.object({
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

  let movieId: string;

  try {
    ({ movieId } = updateMovieParams.parse(req.params));
  } catch (error) {
    return res.status(400).send({ error: "Filme não encontrado!" });
  }

  const validGenres = [
    "Ação",
    "Comédia",
    "Drama",
    "Ficção Científica",
    "Suspense",
    "Terror",
  ];

  try {
    const requestBody = req.body as UpdateMovieRequest;

    const { title, genres, description, demo_content, content } =
      updateMovieBody.parse(requestBody);

    // Check if movie exists
    const existingMovie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!existingMovie) {
      return res.status(404).send({ error: "Filme não encontrado" });
    }

    if (!title || !description || !demo_content.trailer_URL || !content.URL) {
      throw new Error("Todos os campos devem ser preenchidos.");
    }

    if (!genres || genres.length === 0) {
      throw new Error(
        "Você precisa escolher pelo menos 1 gênero para o filme."
      );
    }

    // Validate genres
    for (const genre of genres) {
      if (!validGenres.includes(genre)) {
        return res
          .status(400)
          .send({ error: `Gênero do filme inválido: ${genre}` });
      }
    }

    // Update movie details in the database
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      include: {
        demo_content: {
          select: {
            id: true,
            trailer_URL: true,
          },
        },
        content: {
          select: {
            id: true,
            URL: true,
          },
        },
      },
      data: {
        title,
        genres,
        description,
        demo_content: {
          update: {
            trailer_URL: demo_content.trailer_URL,
          },
        },
        content: {
          update: {
            URL: content.URL,
          },
        },
        updated_at: new Date(),
      },
    });

    return res.status(200).send(updatedMovie);
  } catch (error: any) {
    console.error("Erro ao atualizar o filme:", error);
    return res.status(400).send({ error: error.message });
  }
}
