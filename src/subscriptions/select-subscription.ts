import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { generateAuthToken } from "../configs/auth";

enum SubscriptionType {
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
  VIP = "VIP",
}

export async function selectSubscription(req: Request, res: Response) {
  const { userId } = req.body as { userId: string };
  const { type } = req.params as { type: SubscriptionType };

  // Função para formatar o tempo restante em dias, horas, minutos e segundos
  function formatTimeRemaining(seconds: number): string {
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${days} dias, ${hours} horas, ${minutes} minutos e ${remainingSeconds} segundos`;
    return formattedTime;
  }

  // Verificar se o tipo de assinatura é válido
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).send({ error: "Usuário não autenticado" });
    }

    // Encontrar a assinatura pelo tipo
    const subscription = await prisma.subscription.findFirst({
      where: { type: type },
    });

    // Verificar se a assinatura existe
    if (!subscription) {
      return res.status(404).send({ error: "Assinatura não encontrada" });
    }

    // Verificar se o usuário já possui uma assinatura ativa
    const subscriptionKey = `user:subscription:${userId}`;
    const timeRemaining = await redis.ttl(subscriptionKey);

    // Se o tempo restante for maior que zero, significa que o usuário já possui uma assinatura ativa
    if (timeRemaining > 0) {
      const formattedTimeRemaining = formatTimeRemaining(timeRemaining);
      return res.status(400).send({
        error: `Você já possui uma assinatura ativa. Tempo restante: ${formattedTimeRemaining}`,
      });
    }

    // Atualizar o usuário com o userSubscriptionId
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionId: subscription.id },
    });

    // Buscar informações do usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Verificar se o usuário existe
    if (!user) {
      return res.status(404).send({ error: "Usuário não encontrado" });
    }

    // Armazenar a subscriptionId no Redis com tempo de vida de 30 dias
    const expirationInSeconds = 60 * 60 * 24 * 30; // 30 dias
    await redis.setex(
      `user:subscription:${userId}`,
      expirationInSeconds,
      subscription.id
    );

    // Verificar se o tipo de assinatura é VIP
    const isVIP = subscription.type === SubscriptionType.VIP;

    if (isVIP) {
      const newTokenVip = generateAuthToken({
        userId,
        userAvatar: user.avatar,
        userName: user.name,
        userEmail: user.email,
        isAdmin: false,
        hasSubscription: true,
        isVIP: true,
      });

      // Retornar o ID do usuário e o ID da assinatura
      return res.status(200).send({
        userId: userId,
        subscriptionId: subscription.id,
        token: newTokenVip,
      });
    } else {
      // Gerar um novo token para o usuário
      const newToken = generateAuthToken({
        userId,
        userAvatar: user.avatar,
        userName: user.name,
        userEmail: user.email,
        isAdmin: false,
        hasSubscription: true,
        isVIP: false,
      });

      // Retornar o ID do usuário e o ID da assinatura
      return res.status(200).send({
        userId: userId,
        subscriptionId: subscription.id,
        token: newToken,
      });
    }
  } catch (error) {
    console.error("Erro ao selecionar a assinatura:", error);
    return res.status(500).send({ error: "Erro interno do servidor" });
  }
}
