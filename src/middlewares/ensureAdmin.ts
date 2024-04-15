import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtConfig } from "../configs/auth";

// Interface para definir o formato do usuário autenticado
interface AuthenticatedUser extends JwtPayload {
  userId: string;
  isAdmin: boolean;
}

// Middleware para garantir que o usuário seja administrador
export async function ensureAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const tokenCookie = req.cookies && req.cookies.token;

  if (!tokenCookie) {
    res.status(401).send({ error: "JWT Token não informado" });
    return;
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(
      tokenCookie,
      jwtConfig.secret
    ) as AuthenticatedUser;

    // Define os dados do usuário autenticado diretamente na requisição para uso posterior
    req.user = decoded;

    // Verifica se o usuário é autenticado e administrador
    if (!decoded.isAdmin) {
      res.status(401).send({
        error:
          "Acesso não autorizado. Apenas administradores podem acessar esta rota",
      });
      return;
    }

    // Se o token for válido e o usuário for administrador, passa para o próximo middleware
    next();
  } catch (error) {
    res.status(401).send({ error: "JWT Token inválido" });
    return;
  }
}
