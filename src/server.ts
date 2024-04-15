require("dotenv").config();
import fastify from "fastify";
import fastifyCors from "fastify-cors";
import fastifyMulter from "fastify-multer";
import cookie from "@fastify/cookie";
import { newMovie } from "./routes/movie/new-movie";
import { getMovies } from "./routes/movie/get-movies";
import { deleteMovie } from "./routes/movie/delete-movie";
import { getMovie } from "./routes/movie/get-movie";
import { updateMovie } from "./routes/movie/update-movie";
import { newUser } from "./routes/user/create-user";
import { updateUser } from "./routes/user/update-user";
import { loginUser } from "./routes/sessions/login";
import { rateMovie } from "./routes/movie/rating-on-movie";
import { selectSubscription } from "./subscriptions/select-subscription";
import { avatarUser } from "./routes/user/avatar-user";
import { getImage } from "./routes/movie/get-image-movie";
import { uploadImageMovie } from "./routes/movie/upload-image-movie";

const app = fastify();

const corsOptions = {
  credentials: true,
  origin: "http://localhost:5173",
};
app.register(fastifyCors, corsOptions);

app.register(cookie);
// Registre o fastify-multer com as configurações necessárias
app.register(fastifyMulter.contentParser);

app.register(newUser);
app.register(loginUser);
app.register(updateUser);
app.register(avatarUser);
app.register(selectSubscription);

app.register(newMovie);
app.register(updateMovie);
app.register(deleteMovie);
app.register(getImage);
app.register(uploadImageMovie);
app.register(getMovie);
app.register(getMovies);
app.register(rateMovie);

const PORT = parseInt(process.env.SERVER_PORT || "3333", 10);
app.listen({ port: PORT }).then(() => {
  console.log(`Server listening on port: ${PORT}`);
});
