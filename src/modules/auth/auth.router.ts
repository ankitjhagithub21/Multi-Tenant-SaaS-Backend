import { Router } from "express";
import { loginController, registerController } from "./auth.controller";
import { validateBody } from "../../middlewares/validateBody";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", validateBody(registerSchema), registerController);
router.post("/login", validateBody(loginSchema), loginController);

export default router;