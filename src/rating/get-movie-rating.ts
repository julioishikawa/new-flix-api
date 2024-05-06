import { prisma } from "../lib/prisma";

export async function getMovieRating(movieId: string): Promise<number> {
  const ratings = await prisma.rating.findMany({
    where: {
      movieId,
    },
    select: {
      rating: true,
    },
  });

  if (ratings.length === 0) {
    return 0; // Retorna 0 se não houver classificações
  }

  const sum = ratings.reduce(
    (acc: number, curr: { rating: number }) => acc + curr.rating,
    0
  );
  const average = sum / ratings.length;
  const percentage = (average / 100) * 100; // Multiplica por 100 para obter a porcentagem

  // Arredonda para o número inteiro mais próximo
  const roundedPercentage = Math.round(percentage);

  return roundedPercentage;
}
