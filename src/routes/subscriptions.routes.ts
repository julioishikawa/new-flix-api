import { Router } from "express";

import { selectSubscription } from "../subscriptions/select-subscription";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { getSubscriptions } from "../subscriptions/get-subscriptions";
import { getUserSubInfos } from "../subscriptions/get-user-sub-infos";

const subscriptionRoutes = Router();

subscriptionRoutes.get("/", ensureAuthenticated, getSubscriptions);
subscriptionRoutes.get("/:userId", ensureAuthenticated, getUserSubInfos);
subscriptionRoutes.post(
  "/select-subscription/:type",
  ensureAuthenticated,
  selectSubscription
);

export { subscriptionRoutes };
