import fs from "fs";
import path from "path";
import { TMP_FOLDER, UPLOADS_FOLDER } from "../configs/upload";

class DiskStorage {
  async saveFile(file: string) {
    await fs.promises.rename(
      path.resolve(TMP_FOLDER, file),
      path.resolve(UPLOADS_FOLDER, file)
    );

    return file;
  }

  async deleteFile(file: string) {
    const filePath = path.resolve(UPLOADS_FOLDER, file);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }

  async verifyFile(file: string) {
    const filePath = path.resolve(TMP_FOLDER, file);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }
}

export default DiskStorage;
