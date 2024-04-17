import { Router } from "express";

import { sessionsRoutes } from "./sessions.routes";
import { moviesRoutes } from "./movies.routes";

const routes = Router();

routes.use("/login", sessionsRoutes);
routes.use("/movielist", moviesRoutes);

export { routes };
