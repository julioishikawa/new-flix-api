import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthenticatedUser } from "../configs/auth";

// Interface para o corpo da requisição de criação de um novo cartão de crédito
interface NewCreditCardRequest {
  cardName: string;
  cardNumber: string;
  expiration: string;
  cvv: number;
}

export async function createUserCreditCard(req: Request, res: Response) {
  const createCreditCardBody = z.object({
    cardName: z.string(),
    cardNumber: z.string(),
    expiration: z.string(),
    cvv: z.number(),
  });

  try {
    const requestBody = req.body as NewCreditCardRequest;

    const { cardName, cardNumber, expiration, cvv } =
      createCreditCardBody.parse(requestBody);

    const authUser = req.user as AuthenticatedUser;

    // Verificar se já existe um cartão com o mesmo número associado ao mesmo usuário
    const existingCard = await prisma.creditCard.findFirst({
      where: {
        userId: authUser.userId,
        cardNumber,
      },
    });

    if (existingCard) {
      return res.status(400).json({
        error:
          "Já existe um cartão de crédito com esse número associado a este usuário",
      });
    }

    // Verificar o comprimento do número do cartão
    if (cardNumber.length !== 19) {
      throw new Error("Número do cartão incorreto.");
    }

    if (!cardName) {
      throw new Error(
        "Você precisa fornecer o nome que está gravado no cartão."
      );
    }

    // Verificar o formato da data de expiração (MM/YY)
    const expirationParts = expiration.split("/");
    if (expirationParts.length !== 2 || !/^\d{2}\/\d{2}$/.test(expiration)) {
      throw new Error("A data de expiração deve estar no formato MM/YY.");
    }

    const [expMonth, expYear] = expirationParts.map(Number);

    // Verificar se o mês é válido (de 1 a 12)
    if (expMonth < 1 || expMonth > 12) {
      throw new Error("Mês de expiração inválido.");
    }

    // Verificar se o ano é válido (de 24 a 99)
    const currentYear = new Date().getFullYear() % 100; // Pegar os dois últimos dígitos do ano atual
    if (expYear < currentYear || expYear > 99) {
      throw new Error("Ano de expiração inválido.");
    }

    // Verificar o comprimento do cvv
    if (cvv.toString().length !== 3) {
      throw new Error("CVV incorreto.");
    }

    // Crie o cartão de crédito associado ao usuário autenticado
    await prisma.creditCard.create({
      data: {
        userId: authUser.userId,
        cardName,
        cardNumber,
        expiration,
        cvv,
      },
    });

    return res
      .status(201)
      .json({ message: "Cartão de crédito criado com sucesso" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
