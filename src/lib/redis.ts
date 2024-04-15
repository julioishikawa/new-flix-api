import Redis from "ioredis";

// Obtenha a URL do Redis do ambiente
const redisUrl = process.env.REDIS_URL;

// Verifique se a URL do Redis está disponível no ambiente
if (!redisUrl) {
  throw new Error("URL do Redis não definida no ambiente.");
}

// Crie uma instância do cliente Redis usando a URL
export const redis = new Redis(redisUrl);
