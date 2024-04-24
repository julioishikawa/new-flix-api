import jwt from "jsonwebtoken";

// Interface para os dados do usuário autenticado
interface AuthenticatedUser {
  userId: string;
  isAdmin: boolean;
  hasSubscription: boolean;
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET || "default",
  expiresIn: "1d",
};

// Função para gerar um token de autenticação
export function generateAuthToken(payload: AuthenticatedUser): string {
  if (!jwtConfig.secret) {
    throw new Error("JWT_SECRET não definido no ambiente");
  }

  const token = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  return token;
}
