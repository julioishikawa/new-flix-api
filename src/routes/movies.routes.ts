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
import { ratingMovie } from "../movie/rating-movie";

const moviesRoutes = Router();
const upload = multer(configureMulter());

moviesRoutes.use(ensureAuthenticated);
moviesRoutes.use(ensureSubscriber);

moviesRoutes.post("/newmovie", ensureAdmin, newMovie);
moviesRoutes.patch(
  "/upload/:movieId",
  upload.single("image"),
  ensureAdmin,
  uploadImageMovie
);
moviesRoutes.post("/:movieId/rating", ratingMovie);
moviesRoutes.get("/", getMovies);
moviesRoutes.get("/:movieId", getMovie);
moviesRoutes.get("/:movieId/image", getImageMovie);
moviesRoutes.put("/editmovie/:movieId", updateMovie);
moviesRoutes.delete("/:movieId", ensureAdmin, deleteMovie);

export { moviesRoutes };
