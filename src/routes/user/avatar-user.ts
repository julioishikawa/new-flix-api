import { FastifyInstance, FastifyRequest } from "fastify";
import { saveFile, UPLOADS_USER_FOLDER } from "../../configs/upload";

export async function avatarUser(app: FastifyInstance) {
  // Rota para upload de arquivos de usuário
  app.patch("/upload-avatar/:userId", async (request, reply) => {
    const files = (request as FastifyRequest).files as Record<string, any>; // Alteração aqui
    const uploadedFiles = [];

    for (const file of Object.values(files)) {
      const fileName = await saveFile(file, UPLOADS_USER_FOLDER);
      uploadedFiles.push(fileName);
    }

    return { files: uploadedFiles };
  });
}
