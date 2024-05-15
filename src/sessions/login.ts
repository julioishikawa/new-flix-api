import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import ms from "ms";
import { generateAuthToken, jwtConfig } from "../configs/auth";
import { redis } from "../lib/redis";

interface LoginRequest {
  email: string;
  password: string;
}

export async function loginUser(req: Request, res: Response) {
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

    // Determine se o usuário tem uma assinatura com base em subscriptionId
    const hasSubscription = !!user.subscriptionId;

    // Verificar se o usuário é VIP
    const isVIP =
      (await redis.get(`user:subscription:${user.id}`)) ===
      "a6b270f2-4464-432a-a7dd-7d31d6f40872"; // vai precisar de alteração caso você builde as subscriptions novamente

    // Gerar token de autenticação
    const token = generateAuthToken({
      userId: user.id,
      userAvatar: user.avatar,
      userName: user.name,
      userEmail: user.email,
      isAdmin: user.isAdmin,
      hasSubscription: hasSubscription,
      isVIP: isVIP,
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
}
