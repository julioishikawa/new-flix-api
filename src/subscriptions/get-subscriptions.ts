import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Corrigindo a definição da função getSubscriptions
export async function getSubscriptions(req: Request, res: Response) {
  try {
    const subscriptions = await prisma.subscription.findMany();
    res.status(200).json({ subscriptions });
  } catch (error) {
    console.error("Erro ao buscar as assinaturas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
