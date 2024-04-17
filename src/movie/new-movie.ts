import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function newMovie(req: Request, res: Response) {
  const createMovieBody = z.object({
    title: z.string(),
    gender: z.string(),
    description: z.string(),
    content: z.object({
      URL: z.string(),
    }),
  });

  try {
    const requestBody = req.body;

    const { title, gender, description, content } =
      createMovieBody.parse(requestBody);

    const image = "default.jpg";

    const movie = await prisma.movie.create({
      data: {
        title,
        image: image,
        gender,
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
