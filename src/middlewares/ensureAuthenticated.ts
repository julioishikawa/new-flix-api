import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../configs/auth";

interface AuthenticatedUser {
  userId: string;
  isAdmin: boolean;
}

// Estende a interface FastifyRequest para incluir a propriedade 'user'
declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function ensureAuthenticated(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const tokenCookie = req.cookies && req.cookies.token;

  if (!tokenCookie) {
    reply.status(401).send({ error: "JWT Token não informado" });
    return;
  }

  try {
    const decoded = jwt.verify(
      tokenCookie,
      jwtConfig.secret
    ) as AuthenticatedUser;

    // Define os dados do usuário autenticado diretamente na requisição para uso posterior
    req.user = decoded;

    // Se o token for válido, segue para a próxima rota
    return;
  } catch (error) {
    reply.status(401).send({ error: "JWT Token inválido" });
    return;
  }
}
