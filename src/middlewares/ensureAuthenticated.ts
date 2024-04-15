import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../configs/auth";

declare global {
  namespace Express {
    interface Request {
      user?: any; // Adjust the type according to your user object structure
    }
  }
}

// Middleware para garantir que o usuário esteja autenticado
export async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenCookie = req.cookies && req.cookies.token;

  if (!tokenCookie) {
    return res.status(401).send({ error: "JWT Token não informado" });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(tokenCookie, jwtConfig.secret);

    // Define os dados do usuário autenticado diretamente na requisição para uso posterior
    req.user = decoded;

    // Se o token for válido, passa para o próximo middleware
    next();
  } catch (error) {
    return res.status(401).send({ error: "JWT Token inválido" });
  }
}
