import fs from "fs";
import path from "path";
import { configureMulter } from "../configs/upload";

// Obtenha a configuração do multer usando a função configureMulter
const { TMP_FOLDER, UPLOADS_FOLDER } = configureMulter();

export class DiskStorage {
  async saveFile(file: any) {
    await fs.promises.rename(
      path.resolve(TMP_FOLDER, file),
      path.resolve(UPLOADS_FOLDER, file)
    );

    return file;
  }

  async deleteFile(file: any) {
    const filePath = path.resolve(UPLOADS_FOLDER, file);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }

  async verifyFile(file: any) {
    const filePath = path.resolve(TMP_FOLDER, file);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }
}
