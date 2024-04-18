import { Request, Response } from "express";
import { DiskUsersStorage } from "../providers/disk-users-storage";
import { prisma } from "../lib/prisma";

interface User {
  id: string;
  avatar: string | null;
}

export async function uploadAvatarUser(request: Request, response: Response) {
  try {
    // Verifica se o arquivo foi enviado
    const file = (request as any).file;
    if (!file) {
      return response.status(400).send({ message: "Nenhum avatar enviado" });
    }

    const userId = request.params.userId;
    const userFileName = file.filename;

    const diskStorage = new DiskUsersStorage();

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      await diskStorage.verifyFile(userFileName);
      return response.status(404).send({ message: "Usuário não encontrado" });
    }

    if (existingUser.avatar) {
      await diskStorage.deleteFile(existingUser.avatar);
    }

    // Salva o arquivo de imagem
    const fileName = await diskStorage.saveFile(userFileName);

    // Atualiza o filme no banco de dados com a nova imagem
    const updatedUser: User = await prisma.user.update({
      where: { id: userId },
      data: { avatar: fileName },
    });

    response.send({
      filename: fileName,
      userId: updatedUser.id,
    });
  } catch (error) {
    console.error("Erro ao enviar a imagem:", error);
    response.status(500).send({
      message: "Erro interno do servidor ao processar o upload de imagem",
    });
  }
}
