import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    console.log('VALIDATION HIT');
    try {
      schema.parse(req.body);
      next();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return res.status(400).json({
        status: 400,
        error: 'Validation Error',
        details: err.errors,
      });
    }
  };
