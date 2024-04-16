import { Router } from "express";

import { loginUser } from "../sessions/login";

const sessionsRoutes = Router();

sessionsRoutes.post("/", loginUser);

export { sessionsRoutes };
