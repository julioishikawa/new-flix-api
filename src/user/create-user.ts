import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

interface NewUserRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAdmin: boolean;
}

export async function createUser(req: Request, res: Response) {
  const createUserBody = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
  });

  try {
    const requestBody = req.body as NewUserRequest;

    const { name, email, password, confirmPassword } =
      createUserBody.parse(requestBody);

    if (!name || !email || !password || !confirmPassword) {
      throw new Error("Todos os campos devem ser preenchidos.");
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "As senhas não correspondem",
      });
    }

    // Verifique se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { selectedSubscription: true },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "O e-mail fornecido já está em uso",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const avatar = "default.jpg";

    const user = await prisma.user.create({
      data: {
        name,
        avatar,
        email,
        password: hashedPassword,
        isAdmin: false,
      },
    });

    return res.status(201).json({ userId: user.id });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
