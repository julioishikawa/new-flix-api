import { Router } from "express";

import { selectSubscription } from "../subscriptions/select-subscription";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const subscriptionRoutes = Router();

subscriptionRoutes.post("/:type", ensureAuthenticated, selectSubscription);

export { subscriptionRoutes };
