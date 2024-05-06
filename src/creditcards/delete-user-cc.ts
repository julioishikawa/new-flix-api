import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedUser } from "../configs/auth";

export async function deleteUserCreditCard(req: Request, res: Response) {
  try {
    const authUser = req.user as AuthenticatedUser;
    const { cardId } = req.params;

    // Verificar se o cartão pertence ao usuário autenticado
    const userCard = await prisma.creditCard.findUnique({
      where: {
        id: cardId,
      },
    });

    if (!userCard || userCard.userId !== authUser.userId) {
      return res
        .status(404)
        .json({ error: "Cartão não encontrado ou não pertence ao usuário" });
    }

    // Excluir o cartão
    await prisma.creditCard.delete({
      where: {
        id: cardId,
      },
    });

    return res
      .status(200)
      .json({ message: "Cartão de crédito excluído com sucesso" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Erro ao excluir o cartão de crédito" });
  }
}
