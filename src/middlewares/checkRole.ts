import { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma/enums";



export const checkRole = (requiredRole:Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Insufficient permissions"
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};