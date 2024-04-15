import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import { DiskStorage } from "../../providers/diskStorage";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";

const app = Router();

interface UpdateUserRequest {
  name: string;
  avatar?: string;
  email: string;
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

export async function updateUser() {
  app.put(
    "/users/:userId",
    ensureAuthenticated,
    async (req: Request, res: Response) => {
      const updateUserParams = z.object({
        userId: z.string().uuid(),
      });

      const { userId } = updateUserParams.parse(req.params);

      const updateUserBody = z
        .object({
          name: z.string(),
          avatar: z.string().nullable(),
          email: z.string().email(),
          oldPassword: z.string(),
          password: z.string(),
          confirmPassword: z.string(),
        })
        .passthrough();

      try {
        const requestBody = req.body as UpdateUserRequest;
        const { name, avatar, email, oldPassword, password, confirmPassword } =
          updateUserBody.parse(req.body);

        const allowedProperties = [
          "name",
          "avatar",
          "email",
          "oldPassword",
          "password",
          "confirmPassword",
        ];

        const unexpectedProperties = Object.keys(requestBody).filter(
          (key) => !allowedProperties.includes(key)
        );

        if (unexpectedProperties.length > 0) {
          return res.status(400).send({
            error:
              "Propriedades adicionais na atualização de usuário que não são permitidas",
            unexpectedProperties,
          });
        }

        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!existingUser) {
          return res.status(404).send({ error: "Usuário não encontrado" });
        }

        if (password !== confirmPassword) {
          return res.status(400).send({
            error: "As senhas não correspondem",
          });
        }

        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail && existingEmail.id !== userId) {
          return res.status(400).send({
            error: "O e-mail fornecido já está em uso",
          });
        }

        const oldPasswordMatch = await bcrypt.compare(
          oldPassword,
          existingUser.password
        );

        if (!oldPasswordMatch) {
          return res.status(401).send({ error: "Senha antiga incorreta" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Se um novo avatar for fornecido, salve-o e exclua o avatar anterior
        if (avatar) {
          const diskUserStorage = new DiskStorage();
          const savedAvatar = await diskUserStorage.saveFile(avatar);

          // Exclua o avatar anterior, se existir
          if (existingUser.avatar) {
            await diskUserStorage.deleteFile(existingUser.avatar);
          }

          // Atualize o nome do avatar no objeto de usuário existente
          existingUser.avatar = savedAvatar;
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            name,
            avatar: avatar || existingUser.avatar, // Use o novo avatar ou o anterior
            email,
            password: hashedPassword,
            updated_at: new Date(),
          },
        });

        return res.status(200).send(updatedUser);
      } catch (error: any) {
        console.error("Erro ao atualizar o usuário:", error);
        return res.status(500).send({ error: "Erro interno do servidor" });
      }
    }
  );
}

export default app;
