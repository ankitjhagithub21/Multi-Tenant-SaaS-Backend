import { cookieOptions } from "../../lib/cookies";
import { AppError } from "../../utils/AppError";
import { getCurrentUser, loginUser, registerUser } from "./auth.service";
import {NextFunction, Request, Response} from "express";

export const registerController = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { name, email, password, organizationName } = req.body;

    const result = await registerUser({
      name,
      email,
      password,
      organizationName,
    });

    res.status(201).json({
      message: "User registered successfully",
      data:result
    });
  } catch (error) {
    console.error("Error in registerController:", error);
    next(error);
  }
}


export const loginController = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { email, password} = req.body;

    const result = await loginUser({
      email,
      password,
    });

    res.cookie('token', result.token, cookieOptions);

    res.status(200).json({
      message: "User logged in successfully",
      data:result.user
    });
  } catch (error) {
    console.error("Error in loginController:", error);
    next(error);
  }
}

export const logoutController = async (req:Request, res:Response, next:NextFunction) => {
  try {
    
    res.clearCookie('token',{maxAge:Date.now()}).status(200).json({
      message: "User logged out successfully",
    });

  } catch (error) {
    console.error("Error in loginoutController:", error);
    next(error);
  }
}

export const getUserController = async (req:Request, res:Response, next:NextFunction) => {
  try {
    
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not found", 404);
    }

    const result = await getCurrentUser(userId);

    res.status(200).json({
      message: "User fetched successfully",
      data:result
    });

  } catch (error) {
    console.error("Error in getUserController:", error);
    next(error);
  }
}