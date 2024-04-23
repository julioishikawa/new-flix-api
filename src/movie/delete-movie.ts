import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { DiskMoviesStorage } from "../providers/disk-movies-storage";

export async function deleteMovie(req: Request, res: Response) {
  const { movieId } = req.params;

  try {
    const existingMovie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: { content: true },
    });

    if (!existingMovie) {
      return res.status(404).send({ error: "Filme não encontrado" });
    }

    // Verificar se existe uma imagem associada ao filme
    if (existingMovie.image) {
      const diskStorage = new DiskMoviesStorage();
      await diskStorage.deleteFile(existingMovie.image);
    }

    // Excluir todos os ratings associados ao filme
    await prisma.rating.deleteMany({
      where: { movieId },
    });

    // Excluir o conteúdo do filme
    await prisma.movieContent.deleteMany({
      where: { movieId },
    });

    // Excluir o conteúdo do filme
    await prisma.movieDemoContent.deleteMany({
      where: { movieId },
    });

    // Excluir o filme
    await prisma.movie.delete({
      where: { id: movieId },
    });

    return res.status(200).send({ message: "Filme deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir filme:", error);
    return res.status(500).send({ error: "Erro interno do servidor" });
  }
}
