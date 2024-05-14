import { prisma } from "../lib/prisma";

export async function getMovieVipVotes(movieId: string): Promise<number> {
  const values = await prisma.vIPVote.findMany({
    where: {
      movieId,
    },
    select: {
      value: true,
    },
  });

  if (values.length === 0) {
    return 0; // Retorna 0 se não houver classificações
  }

  const sum = values.reduce(
    (acc: number, curr: { value: number }) => acc + curr.value,
    0
  );
  const average = sum / values.length;
  const percentage = (average / 100) * 100; // Multiplica por 100 para obter a porcentagem

  // Arredonda para o número inteiro mais próximo
  const roundedPercentage = Math.round(percentage);

  return roundedPercentage;
}
