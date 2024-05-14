import multer from "multer";
import { Router } from "express";

import { configureMulter } from "../configs/upload";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { ensureSubscriber } from "../middlewares/ensureSubscriber";
import { ensureAdmin } from "../middlewares/ensureAdmin";

import { newMovie } from "../movie/new-movie";
import { uploadImageMovie } from "../movie/upload-image-movie";
import { getMovies } from "../movie/get-movies";
import { getImageMovie } from "../movie/get-image-movie";
import { getMovie } from "../movie/get-movie";
import { deleteMovie } from "../movie/delete-movie";
import { updateMovie } from "../movie/update-movie";
import { ratingMovie } from "../rating/rating-movie";
import { vipVotingMovie } from "../subscriptions/vip-vote";
import { ensureVIP } from "../middlewares/ensureVIP";

const moviesRoutes = Router();
const upload = multer(configureMulter());

moviesRoutes.use(ensureAuthenticated);

moviesRoutes.post("/newmovie", ensureAdmin, newMovie);
moviesRoutes.patch(
  "/upload/:movieId",
  upload.single("image"),
  ensureAdmin,
  uploadImageMovie
);
moviesRoutes.put("/edit-movie/:movieId", ensureAdmin, updateMovie);
moviesRoutes.delete("/:movieId", ensureAdmin, deleteMovie);
moviesRoutes.post("/:movieId/rating", ensureSubscriber, ratingMovie);
moviesRoutes.post("/:movieId/vip-vote", ensureVIP, vipVotingMovie);
moviesRoutes.get("/", ensureSubscriber, getMovies);
moviesRoutes.get("/:movieId", ensureSubscriber, getMovie);
moviesRoutes.get("/:movieId/image", ensureSubscriber, getImageMovie);

export { moviesRoutes };
