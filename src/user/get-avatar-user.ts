import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma";
import { UPLOADS_USERS_FOLDER } from "../configs/upload";

export async function getAvatarUser(req: Request, res: Response) {
  try {
    const { userId } = req.params as { userId: string };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.avatar) {
      throw new Error("Avatar não foi encontrado");
    }

    const filePath = path.join(UPLOADS_USERS_FOLDER, user.avatar);

    const fileContent = fs.readFileSync(filePath);

    res.setHeader("Content-Type", "image/jpeg");
    return res.send(fileContent);
  } catch (error: any) {
    return res.status(404).send({ error: error.message });
  }
}
