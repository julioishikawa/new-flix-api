import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import ms from "ms";
import { generateAuthToken, jwtConfig } from "../../configs/auth";

const app = Router();

interface LoginRequest {
  email: string;
  password: string;
}

export async function loginUser() {
  app.post("/login", async (req: Request, res: Response) => {
    const loginBody = z.object({
      email: z.string(),
      password: z.string(),
    });

    try {
      const { email, password } = loginBody.parse(req.body) as LoginRequest;

      // Verificar se o usuário existe no banco de dados
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).send({ error: "Credenciais inválidas" });
      }

      // Verificar se a senha está correta
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).send({ error: "Credenciais inválidas" });
      }

      // Gerar token de autenticação
      const token = generateAuthToken({
        userId: user.id,
        isAdmin: user.isAdmin,
      });

      // Configurar cookie com o token JWT
      res.cookie("token", token, {
        path: "/",
        httpOnly: false,
        sameSite: "strict",
        secure: false, // Altere para true se estiver usando HTTPS
        maxAge: ms(jwtConfig.expiresIn),
      });

      // Se o usuário for assinante, você pode adicionar aqui a lógica para acessar a lista de filmes
      return res.status(200).send({ token, userId: user.id });
    } catch (error: any) {
      return res.status(400).send({ error: error.message });
    }
  });
}

export default app;
