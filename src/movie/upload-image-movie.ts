import { Request, Response } from "express";
import { DiskMoviesStorage } from "../providers/disk-movies-storage";
import { prisma } from "../lib/prisma";

interface Movie {
  id: string;
  image: string;
}

export async function uploadImageMovie(request: Request, response: Response) {
  try {
    const file = (request as any).file;
    if (!file) {
      return response.status(400).send({ message: "Nenhuma imagem enviada" });
    }

    const movieId = request.params.movieId;
    const imageFileName = file.filename;

    const diskStorage = new DiskMoviesStorage();

    const existingMovie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!existingMovie) {
      // Verifica se o arquivo é válido antes de salvar
      await diskStorage.verifyFile(imageFileName);
      return response.status(404).send({ message: "Filme não encontrado" });
    }

    if (existingMovie.image) {
      await diskStorage.deleteFile(existingMovie.image);
    }

    const fileName = await diskStorage.saveFile(imageFileName);

    const updatedMovie: Movie = await prisma.movie.update({
      where: { id: movieId },
      data: { image: fileName },
    });

    response.send({
      filename: fileName,
      movieId: updatedMovie.id,
    });
  } catch (error) {
    console.error("Erro ao enviar a imagem:", error);
    response.status(500).send({
      message: "Erro interno do servidor ao processar o upload de imagem",
    });
  }
}
