import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedUser } from "../configs/auth"; // Importe a interface AuthenticatedUser se necessário

export async function getUserCreditCards(req: Request, res: Response) {
  try {
    // Extrair o userId do usuário autenticado do objeto req.user
    const authUser = req.user as AuthenticatedUser;

    // Buscar todos os cartões de crédito associados ao userId
    const userCreditCards = await prisma.creditCard.findMany({
      where: {
        userId: authUser.userId,
      },
    });

    console.log(userCreditCards);

    // Retornar os cartões de crédito encontrados
    return res.status(200).json(userCreditCards);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Erro ao buscar os cartões de crédito do usuário" });
  }
}
