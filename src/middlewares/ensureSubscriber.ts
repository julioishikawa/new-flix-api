import jwt from "jsonwebtoken";
import { jwtConfig } from "../configs/auth";
import { redis } from "../lib/redis";

// Declaração da interface AuthenticatedUser
interface AuthenticatedUser {
  userId: string;
  isAdmin: boolean;
  hasSubscription: boolean;
}

export async function ensureSubscriber(req: any, res: any, next: any) {
  const tokenCookie = req.cookies && req.cookies.token;

  if (!tokenCookie) {
    res.status(401).send({ error: "JWT Token não informado" });
    return;
  }

  try {
    const decoded = jwt.verify(
      tokenCookie,
      jwtConfig.secret
    ) as AuthenticatedUser;

    // Define os dados do usuário autenticado diretamente na requisição para uso posterior
    req.user = decoded;

    // Verificar se o usuário tem uma assinatura
    if (!decoded.isAdmin) {
      const hasSubscription = await redis.get(
        `user:subscription:${decoded.userId}`
      );
      decoded.hasSubscription = Boolean(hasSubscription);

      // Se o usuário não for assinante, retorna uma mensagem
      if (!decoded.hasSubscription) {
        res.status(401).send({ error: "Você não é um assinante" });
        return;
      }
    }

    // Se o token for válido, segue para a próxima rota
    next();
  } catch (error) {
    res.status(401).send({ error: "JWT Token inválido" });
    return;
  }
}
