import bcrypt from 'bcrypt';
//import { sequelize } from "./config/database";
import { User } from '../models/user';
import { UniqueConstraintError } from 'sequelize';
import jwt from 'jsonwebtoken';

import { generateAccessToken, generateRefreshToken } from '../util/jwt';

export type HttpError = Error & {
  status?: number;
};

export type tsUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  password: string;
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

    return await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      age: userData.age,
    });
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
    const error: HttpError = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return await User.destroy({ where: { id } });
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.toJSON().password);

  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(user.toJSON());
  const refreshToken = generateRefreshToken(user.toJSON());

  return { accessToken, refreshToken };
};

const REFRESH_SECRET = 'refresh_secret';

export const refreshAccessToken = (refreshToken: string): string => {
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  try {
    // on vérifie et on extrait l'id
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload;

    // on reconstruit un objet minimal compatible avec tsUser
    const accessToken = generateAccessToken(decoded.id);
    console.log(decoded);

    return accessToken;
  } catch {
    throw new Error('Invalid refresh token');
  }
};
