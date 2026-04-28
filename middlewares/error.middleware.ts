import { Request, Response } from 'express';
import { ZodError } from 'zod';

// 404 — routes inconnues
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} does not exist`,
  });
};

// Erreur custom pour typer le status
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Gestionnaire d'erreurs centralisé — TOUJOURS EN DERNIER
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
): void => {
  // 400 — erreur de validation Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 400,
      error: 'Validation Error',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // 400/404/etc — erreur custom AppError
  if (err instanceof AppError) {
    res.status(err.status).json({
      status: err.status,
      error: err.name,
      message: err.message,
    });
    return;
  }

  // 500 — erreur interne inattendue
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  console.error('ERROR:', message);
  res.status(500).json({
    status: 500,
    error: 'Internal Server Error',
    message,
  });
};
