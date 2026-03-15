import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { AppError } from "../utils/AppError";

export const isAuth= async (req:Request, res:Response, next:NextFunction) => {
    try {
        
        const token = req.cookies?.token;
        
        if(!token) {
            throw new AppError("Unauthorized", 401);
        }
        const decoded = verifyToken(token);

        if(!decoded) {
            throw new AppError("Token is invalid or expired", 401);
        }

        req.user = {id: decoded.id, orgId: decoded.orgId, role:decoded.role };

        next();
    } catch (error) {
        next(error);
    }
}