import { Router } from "express";

import { selectSubscription } from "../subscriptions/select-subscription";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { getSubscriptions } from "../subscriptions/get-subscriptions";

const subscriptionRoutes = Router();

subscriptionRoutes.get("/", ensureAuthenticated, getSubscriptions);
subscriptionRoutes.post(
  "/select-subscription/:type",
  ensureAuthenticated,
  selectSubscription
);

export { subscriptionRoutes };
