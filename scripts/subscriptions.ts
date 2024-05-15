import { PrismaClient, SubscriptionType } from "@prisma/client";

const prisma = new PrismaClient();

async function subscriptions() {
  await prisma.$connect();

  // Definir os dados das assinaturas
  const subscriptionData = [
    {
      type: SubscriptionType.BASIC,
      name: "BASIC",
      price: 19.99,
      benefits: [
        "Você tem acesso a todos os filmes",
        "Você pode classificar filmes",
        "Com Anúncios",
      ],
    },
    {
      type: SubscriptionType.PREMIUM,
      name: "PREMIUM",
      price: 29.99,
      benefits: [
        "Você tem acesso a todos os filmes",
        "Você pode classificar filmes",
        "Sem Anúncios",
      ],
    },
    {
      type: SubscriptionType.VIP,
      name: "VIP",
      price: 49.99,
      benefits: [
        "Você tem acesso a todos os filmes",
        "Sem Anúncios",
        "Você pode classificar filmes",
        "Pode participar do TOP 10 com o voto VIP (Terá influcência no TOP 10)",
      ],
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
