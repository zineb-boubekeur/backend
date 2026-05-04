/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
//import { sequelize } from "./config/database";
import { User } from '../models/user';
import { UniqueConstraintError } from 'sequelize';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/error.middleware';
import { generateAccessToken, generateRefreshToken } from '../util/jwt';

export type HttpError = Error & { status?: number };

export type tsUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  password: string;
  nbTokens: number;
};

export const getAllUsers = async () => {
  return await User.findAll();
};

export const getUserById = async (id: number) => {
  const user = await User.findByPk(id);
  if (!user) {
    const error: HttpError = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user.toJSON() as tsUser;
};

export const updateUser = async (id: number, data: tsUser) => {
  const user = await User.findByPk(id);
  if (!user) {
    const error = new Error('User not found') as Error & { status?: number };
    error.status = 404;
    throw error;
  }
  await user.update(data);
  return user;
};

export const addNewUser = async (userData: tsUser) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      age: userData.age,
      nbTokens: 20,
    });
    const accessToken = generateAccessToken(user.toJSON());
    const refreshToken = generateRefreshToken(user.toJSON());
    return { accessToken, refreshToken, user };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new Error('Email already exists, please use another email');
    }
    throw err;
  }
};

export const deleteUserById = async (id: number) => {
  const user = await User.findByPk(id);
  if (!user) {
    const error = new AppError(404, 'user not found');
    throw error;
  }
  return await User.destroy({ where: { id } });
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new AppError(401, 'Invalid credentials');
    throw error;
  }
  const valid = await bcrypt.compare(password, user.toJSON().password);
  if (!valid) {
    const error = new AppError(401, 'Invalid credentials');
    throw error;
  }
  const accessToken = generateAccessToken(user.toJSON());
  const refreshToken = generateRefreshToken(user.toJSON());
  return { accessToken, refreshToken, user };
};

const REFRESH_SECRET = 'refresh_secret';

export const refreshAccessToken = (refreshToken: string): string => {
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload;
    const accessToken = generateAccessToken(decoded.id);
    console.log(decoded);
    return accessToken;
  } catch {
    throw new Error('Invalid refresh token');
  }
};

export const decrementeTokens = async (idUser: number, nb: number) => {
  const user = (await User.findByPk(idUser)) as any;
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (user.nbTokens < nb) {
    throw new AppError(400, 'No tokens left');
  }
  await user.decrement('nbTokens', { by: nb });
  return user;
};

const MAX_TOKENS = 20;

export async function refillTokens(userId: number) {
  const user = (await User.findByPk(userId)) as any;
  if (!user) throw new AppError(404, 'User not found');

  const now = new Date();
  const last = new Date(user.lastTokenUpdate);
  const diffMs = now.getTime() - last.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes <= 0) return user;

  const gained = Math.min(MAX_TOKENS - user.nbTokens, minutes * 5);
  const newTokens = Math.min(MAX_TOKENS, user.nbTokens + gained);

  await User.update(
    { nbTokens: newTokens, lastTokenUpdate: now },
    { where: { id: userId } },
  );

  return { ...user.toJSON(), nbTokens: newTokens, lastTokenUpdate: now };
}
