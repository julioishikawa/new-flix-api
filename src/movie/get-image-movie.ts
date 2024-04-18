import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma";
import { UPLOADS_MOVIES_FOLDER } from "../configs/upload";

export async function getImageMovie(req: Request, res: Response) {
  try {
    const { movieId } = req.params as { movieId: string };

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie || !movie.image) {
      throw new Error("Imagem não foi encontrada");
    }

    const filePath = path.join(UPLOADS_MOVIES_FOLDER, movie.image);

    const fileContent = fs.readFileSync(filePath);

    res.setHeader("Content-Type", "image/jpeg");
    return res.send(fileContent);
  } catch (error: any) {
    return res.status(404).send({ error: error.message });
  }
}
