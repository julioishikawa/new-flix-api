import { FastifyInstance } from "fastify";
import { MULTER } from "../../configs/upload";
import DiskStorage from "../../providers/diskStorage";
import { ensureAdmin } from "../../middlewares/ensureAdmin";

export async function uploadImageMovie(app: FastifyInstance) {
  // Definir a rota para lidar com o upload de imagens do filme
  app.patch<{ Params: { movieId: string } }>(
    "/newmovie/:movieId",
    { preHandler: [ensureAdmin, MULTER] },
    async (request, reply) => {
      try {
        console.log("Request body:", request.body);
        console.log("Request file:", (request as any).file);

        // Verifica se o arquivo foi enviado
        const file = (request as any).file;
        if (!file) {
          return reply.code(400).send({ message: "Nenhuma imagem enviada" });
        }

        // Renomeia o arquivo para incluir o ID do filme no nome
        const diskStorage = new DiskStorage();
        const fileName = await diskStorage.saveFile(file.filename); // Corrigindo número de argumentos

        reply.send({
          filename: fileName, // Se desejar, você pode enviar o nome do arquivo de volta
        });
      } catch (error) {
        console.error("Erro ao enviar a imagem:", error);
        reply.code(500).send({
          message: "Erro interno do servidor ao processar o upload de imagem",
        });
      }
    }
  );
}
