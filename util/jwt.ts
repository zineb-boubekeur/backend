import jwt from 'jsonwebtoken';
import { tsUser } from '../services/user.service';

const ACCESS_SECRET = 'access_secret';
const REFRESH_SECRET = 'refresh_secret';

export const generateAccessToken = (user: tsUser) => {
  return jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (user: tsUser) => {
  return jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
};
