import { Router } from "express";

import { sessionsRoutes } from "./sessions.routes";
import { moviesRoutes } from "./movies.routes";
import { subscriptionRoutes } from "./subscriptions.routes";
import { usersRoutes } from "./users.routes";

const routes = Router();

routes.use("/login", sessionsRoutes);
routes.use("/users", usersRoutes);
routes.use("/movielist", moviesRoutes);
routes.use("/select-subscription", subscriptionRoutes);

export { routes };
