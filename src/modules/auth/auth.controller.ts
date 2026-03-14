import { registerUser } from "./auth.service";
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
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        organizationId: result.user.organizationId,
      },
      organization: {
        id: result.organization.id,
        organizationName: result.organization.organizationName,
      },
    });
  } catch (error) {
    console.error("Error in registerController:", error);
    next(error);
  }
}