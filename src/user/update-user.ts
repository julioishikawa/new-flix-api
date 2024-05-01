import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

interface UpdateUserRequest {
  name: string;
  email: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export async function updateUser(req: Request, res: Response) {
  const updateUserParams = z.object({
    userId: z.string().uuid(),
  });

  const updateUserBody = z.object({
    name: z.string(),
    email: z.string().email(),
    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  });

  let userId: string;

  try {
    ({ userId } = updateUserParams.parse(req.params));
  } catch (error) {
    return res.status(400).send({ error: "Usuário não encontrado!" });
  }

  try {
    const requestBody = req.body as UpdateUserRequest;
    const { name, email, oldPassword, newPassword, confirmPassword } =
      updateUserBody.parse(requestBody);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).send({ error: "Usuário não encontrado" });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail && existingEmail.id !== userId) {
      return res.status(400).send({
        error: "O e-mail fornecido já está em uso",
      });
    }

    if (newPassword || confirmPassword) {
      if (!oldPassword) {
        return res.status(400).send({
          error: "Para alterar a senha, a senha antiga deve ser fornecida",
        });
      }

      const oldPasswordMatch = await bcrypt.compare(
        oldPassword,
        existingUser.password
      );

      if (!oldPasswordMatch) {
        return res.status(401).send({ error: "Senha antiga incorreta" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).send({
          error: "As senhas não correspondem",
        });
      }
    }

    const hashedPassword = newPassword
      ? await bcrypt.hash(newPassword, 10)
      : existingUser.password;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return res.status(200).send(updatedUser);
  } catch (error: any) {
    console.error("Erro ao atualizar o usuário:", error);
    return res.status(400).send({ error: error.message });
  }
}
