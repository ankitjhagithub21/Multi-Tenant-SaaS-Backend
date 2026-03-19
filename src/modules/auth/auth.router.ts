import { isAuth } from './../../middlewares/isAuth';
import { Router } from "express";
import { forgotPasswordController, getUserController, loginController, logoutController, registerController, resetPasswordController } from "./auth.controller";
import { validateBody } from "../../middlewares/validateBody";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "./auth.schema";
import { authStrictLimiter, authModerateLimiter, authLightLimiter } from "../../middlewares/rateLimiter";

const router = Router();

// Strict rate limiting for registration and login (5 requests per 15 minutes)
router.post("/register", authStrictLimiter, validateBody(registerSchema), registerController);
router.post("/login", authStrictLimiter, validateBody(loginSchema), loginController);

// Light rate limiting for logout and user info (50 requests per 15 minutes)
router.post("/logout", authLightLimiter, logoutController);
router.get("/user", authLightLimiter, isAuth, getUserController);

// Moderate rate limiting for password reset (3 requests per hour)
router.post("/forgot-password", authModerateLimiter, validateBody(forgotPasswordSchema), forgotPasswordController);
router.post("/reset-password/:token", authModerateLimiter, validateBody(resetPasswordSchema), resetPasswordController);

export default router;