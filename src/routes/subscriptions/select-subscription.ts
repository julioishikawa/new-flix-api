import { Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";
import { redis } from "../../lib/redis";

const app = Router();

// Definição da enumeração SubscriptionType
enum SubscriptionType {
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
}

// Função para formatar o tempo restante em dias, horas, minutos e segundos
function formatTimeRemaining(seconds: number): string {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${days} dias, ${hours} horas, ${minutes} minutos e ${remainingSeconds} segundos`;
  return formattedTime;
}

export async function selectSubscription() {
  app.post(
    "/select-subscription/:type",
    ensureAuthenticated,
    async (req: Request, res: Response) => {
      const { userId } = req.body as { userId: string };
      const { type } = req.params as { type: SubscriptionType };

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

        // Armazenar a subscriptionId no Redis com tempo de vida de 30 dias
        const expirationInSeconds = 60 * 60 * 24 * 30; // 30 dias
        await redis.setex(
          `user:subscription:${userId}`,
          expirationInSeconds,
          subscription.id
        );

        // Retornar o ID do usuário e o ID da assinatura
        return res.status(200).send({
          userId: userId,
          subscriptionId: subscription.id,
        });
      } catch (error) {
        console.error("Erro ao selecionar a assinatura:", error);
        return res.status(500).send({ error: "Erro interno do servidor" });
      }
    }
  );

  return app;
}
