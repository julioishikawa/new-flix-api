import jwt from "jsonwebtoken";
import { jwtConfig } from "../configs/auth";
import { redis } from "../lib/redis";

// Declaração da interface AuthenticatedUser
interface AuthenticatedUser {
  userId: string;
  isAdmin: boolean;
  hasSubscription: boolean;
  isVIP: boolean; // Adicionado para verificar se o usuário é um VIP
}

export async function ensureVIP(req: any, res: any, next: any) {
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

    // Verificar se o usuário é um VIP
    if (!decoded.isAdmin) {
      const isVIP = await redis.get(`user:subscription:${decoded.userId}`);
      decoded.isVIP = isVIP === "ed964087-db2b-4e22-b2dc-e4b4a2a2554f"; // Verifica se a assinatura é VIP

      // Se o usuário não for VIP, retorna uma mensagem
      if (!decoded.isVIP) {
        res.status(401).send({ error: "Você não é um usuário VIP" });
        return;
      }
    }

    // Se o token for válido e o usuário for VIP, segue para a próxima rota
    next();
  } catch (error) {
    res.status(401).send({ error: "JWT Token inválido" });
    return;
  }
}
