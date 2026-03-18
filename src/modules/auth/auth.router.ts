import { isAuth } from './../../middlewares/isAuth';
import { Router } from "express";
import { forgotPasswordController, getUserController, loginController, logoutController, registerController, resetPasswordController } from "./auth.controller";
import { validateBody } from "../../middlewares/validateBody";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "./auth.schema";

const router = Router();

router.post("/register", validateBody(registerSchema), registerController);
router.post("/login", validateBody(loginSchema), loginController);
router.post("/logout", logoutController)
router.get("/user", isAuth ,getUserController)
router.post("/forgot-password", validateBody(forgotPasswordSchema) , forgotPasswordController)
router.post("/reset-password/:token",validateBody(resetPasswordSchema), resetPasswordController)

export default router;