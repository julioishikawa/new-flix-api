import multer from "multer";
import { Router } from "express";

import { configureMulter } from "../configs/upload";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

import { createUser } from "../user/create-user";
import { updateUser } from "../user/update-user";
import { uploadAvatarUser } from "../user/upload-avatar-user";
import { getAvatarUser } from "../user/get-avatar-user";

import { createUserCreditCard } from "../creditcards/create-user-cc";
import { getUserCreditCards } from "../creditcards/get-user-ccs";
import { deleteUserCreditCard } from "../creditcards/delete-user-cc";

const usersRoutes = Router();
const upload = multer(configureMulter());

usersRoutes.post("/newuser", createUser);
usersRoutes.patch(
  "/upload/:userId",
  upload.single("avatar"),
  ensureAuthenticated,
  uploadAvatarUser
);
usersRoutes.get("/:userId/avatar", ensureAuthenticated, getAvatarUser);
usersRoutes.put("/:userId", ensureAuthenticated, updateUser);
usersRoutes.post("/:userId/new-cc", ensureAuthenticated, createUserCreditCard);
usersRoutes.get(
  "/:userId/credit-cards",
  ensureAuthenticated,
  getUserCreditCards
);
usersRoutes.delete(
  "/:userId/:cardId",
  ensureAuthenticated,
  deleteUserCreditCard
);

export { usersRoutes };
