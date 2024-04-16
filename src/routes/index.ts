import { Router } from "express";

import { sessionsRoutes } from "./sessions.routes";

const routes = Router();

routes.use("/login", sessionsRoutes);

export { routes };
