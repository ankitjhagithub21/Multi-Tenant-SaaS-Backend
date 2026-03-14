import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    req.body = result.data;
    next();
  };