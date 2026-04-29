/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

import jwt from 'jsonwebtoken';

const ACCESS_SECRET = 'access_secret';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // format: "Bearer token"
    const token = header.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, ACCESS_SECRET) as jwt.JwtPayload;

    req.user = decoded;

    next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const authorizeUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const userIdFromToken = req.user?.id;
  const userIdFromParams = req.params.id;
  console.log('personne connecté :');
  console.log(userIdFromToken);
  console.log('personne a qui on modifie:');
  console.log(userIdFromParams);

  if (!userIdFromToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (String(userIdFromToken) !== String(userIdFromParams)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};
