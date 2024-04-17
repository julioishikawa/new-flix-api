import { Request, Response } from "express";
import { DiskStorage } from "../providers/diskStorage";
import { prisma } from "../lib/prisma";

interface Movie {
  id: string;
  image: string;
}

export async function uploadImageMovie(request: Request, response: Response) {
  try {
    // Verifica se o arquivo foi enviado
    const file = (request as any).file;
    if (!file) {
      return response.status(400).send({ message: "Nenhuma imagem enviada" });
    }

    const movieId = request.params.movieId;
    const imageFileName = file.filename;

    const diskStorage = new DiskStorage();

    // Salva o arquivo de imagem
    const fileName = await diskStorage.saveFile(imageFileName);

    // Atualiza o filme no banco de dados com a nova imagem
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
