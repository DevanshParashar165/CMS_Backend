import { Router } from "express";
import { getTodayBillingByClinicId } from "../controllers/billing.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const billingRouter = Router();

billingRouter.use(authenticate);

billingRouter.get('/today-bills/:id',getTodayBillingByClinicId);

export default billingRouter;