import { Router } from "express";
import { sendAnalytics, trackAction, trackingScript } from "./handlers";

const router = Router();

router.post("/track", trackAction);
router.get("/api/analytics", sendAnalytics);

router.get("/scripts/tracker", trackingScript);

export default router;
