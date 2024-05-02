import { Request, Response } from "express";
import { redis } from "../lib/redis";
import { prisma } from "../lib/prisma";

export async function getUserSubInfos(req: Request, res: Response) {
  const userId = req.user.userId;

  function formatTimeRemaining(seconds: number): string {
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    const formattedTime = `${days} dias, ${hours} horas, ${minutes} minutos.`;
    return formattedTime;
  }

  try {
    // Verificar se o usuário possui uma assinatura ativa
    const subscriptionKey = `user:subscription:${userId}`;
    const timeRemaining = await redis.ttl(subscriptionKey);

    // Se o tempo restante for maior que zero, enviar o tempo restante da assinatura
    if (timeRemaining > 0) {
      const formattedTimeRemaining = formatTimeRemaining(timeRemaining);

      // Obter o tipo de assinatura do usuário
      const userSubscription = await prisma.user.findUnique({
        where: { id: userId },
        select: { selectedSubscription: { select: { type: true } } },
      });

      const subscriptionType =
        userSubscription?.selectedSubscription?.type ?? "Não assinante";

      return res.status(200).send({
        remainingTime: formattedTimeRemaining,
        subscriptionType: subscriptionType,
      });
    } else {
      // Se o tempo restante for zero ou negativo, a assinatura expirou
      return res.status(200).send({
        remainingTime: "Não assinante",
        subscriptionType: "Não assinante",
      });
    }
  } catch (error) {
    console.error("Erro ao buscar o tempo restante da assinatura:", error);
    return res.status(500).send({ error: "Erro interno do servidor" });
  }
}
