import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { UPLOADS_FOLDER } from "../../configs/upload";
import path from "path";
import fs from "fs";

interface UploadImageParams {
  filename: string; // Nome do arquivo da imagem
}

export async function getImage(app: FastifyInstance) {
  app.get<{ Params: UploadImageParams }>(
    "/get-image/:filename",
    async (
      request: FastifyRequest<{ Params: UploadImageParams }>,
      reply: FastifyReply
    ) => {
      try {
        const { filename } = request.params;

        // Verificar se o arquivo existe no diretório de uploads
        const filePath = path.join(UPLOADS_FOLDER, filename);
        if (!fs.existsSync(filePath)) {
          throw new Error("Image not found");
        }

        // Ler o conteúdo do arquivo
        const fileContent = fs.readFileSync(filePath);

        // Definir o tipo de conteúdo da resposta como image/jpeg
        reply.header("Content-Type", "image/jpeg");

        // Retornar o conteúdo do arquivo como resposta
        return reply.send(fileContent);
      } catch (error: any) {
        // Em caso de erro, retornar uma resposta de erro com o status 404 Not Found
        return reply.status(404).send({ error: error.message });
      }
    }
  );
}
