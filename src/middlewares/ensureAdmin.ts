import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../configs/auth";

interface AuthenticatedUser {
  userId: string;
  isAdmin: boolean;
}

export async function ensureAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const tokenCookie = request.cookies && request.cookies.token;

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
    request.user = decoded;

    // Verifica se o usuário é autenticado e administrador
    if (!decoded.isAdmin) {
      reply.status(401).send({
        error:
          "Acesso não autorizado. Apenas administradores podem acessar esta rota",
      });
      return;
    }

    // Se o token for válido e o usuário for administrador, segue para a próxima rota
    return;
  } catch (error) {
    reply.status(401).send({ error: "JWT Token inválido" });
    return;
  }
}
