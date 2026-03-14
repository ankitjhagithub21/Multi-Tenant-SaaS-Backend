import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { AppError } from "../utils/AppError";

export const isAuth= async (req:Request, res:Response, next:NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Unauthorized", 401);
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyToken(token);

        console.log("Decoded token in isAuth middleware:", decoded);

        next();
    } catch (error) {
        next(error);
    }
}