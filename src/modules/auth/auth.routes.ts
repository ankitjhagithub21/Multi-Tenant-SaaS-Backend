import { Router } from "express";
import { registerController } from "./auth.controller";
import { validateBody } from "../../middlewares/validateBody";
import { registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", validateBody(registerSchema), registerController);

export default router;