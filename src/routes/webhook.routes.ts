import { Router } from "express";
import { receiveWebhook } from "../controllers/webhook.controller";

const router = Router();

// Twilio NO usa GET para verificar. Solo necesitamos el POST.
router.post("/", receiveWebhook);

export default router;
