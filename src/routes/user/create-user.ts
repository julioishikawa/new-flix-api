import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";

interface NewUserRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAdmin: boolean;
}

export async function newUser(app: FastifyInstance) {
  app.post("/newuser", async (req: FastifyRequest, reply) => {
    const createUserBody = z
      .object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
        confirmPassword: z.string(),
      })
      .passthrough();

    try {
      const requestBody = req.body as NewUserRequest;

      const { name, email, password, confirmPassword } = createUserBody.parse(
        req.body
      );

      const allowedProperties = [
        "name",
        "email",
        "password",
        "confirmPassword",
      ];
      const unexpectedProperties = Object.keys(requestBody).filter(
        (key) => !allowedProperties.includes(key)
      );

      if (unexpectedProperties.length > 0) {
        return reply.status(400).send({
          error:
            "Propriedades adicionais na criação de usuário que não são permitidas",
          unexpectedProperties,
        });
      }

      if (password !== confirmPassword) {
        return reply.status(400).send({
          error: "As senhas não correspondem",
        });
      }

      // Verifique se o e-mail já está em uso
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { selectedSubscription: true },
      });

      if (existingUser) {
        return reply.status(400).send({
          error: "O e-mail fornecido já está em uso",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          isAdmin: false,
        },
      });

      return reply.status(201).send({ userId: user.id });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });
}
