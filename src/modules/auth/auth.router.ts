import { isAuth } from './../../middlewares/isAuth';
import { Router } from "express";
import { getUserController, loginController, logoutController, registerController } from "./auth.controller";
import { validateBody } from "../../middlewares/validateBody";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", validateBody(registerSchema), registerController);
router.post("/login", validateBody(loginSchema), loginController);
router.post("/logout", logoutController)
router.get("/user", isAuth ,getUserController)

export default router;