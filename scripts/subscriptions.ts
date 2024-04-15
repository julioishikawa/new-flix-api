// create-update-subscriptions.ts

import { PrismaClient, SubscriptionType } from "@prisma/client";

const prisma = new PrismaClient();

async function subscriptions() {
  await prisma.$connect();

  // Definir os dados das assinaturas
  const subscriptionData = [
    {
      type: SubscriptionType.BASIC,
      name: "Basic Subscription",
      price: 19.99,
      benefits: ["Benefit 1", "Benefit 2"],
    },
    {
      type: SubscriptionType.PREMIUM,
      name: "Premium Subscription",
      price: 29.99,
      benefits: ["Benefit 1", "Benefit 2", "Benefit 3"],
    },
  ];

  // Para cada assinatura, criar ou atualizar no banco de dados
  for (const data of subscriptionData) {
    await prisma.subscription.upsert({
      where: { id: data.type },
      update: {
        name: data.name,
        price: data.price,
        benefits: data.benefits,
      },
      create: data,
    });
  }

  await prisma.$disconnect();
}

subscriptions().catch((error) => {
  console.error(error);
  process.exit(1);
});
