import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { toUserDTO } from '../util/user.dto';
import { refillTokens } from '../services/user.service';

export interface AuthRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

export const addUser = async (req: AuthRequest, res: Response) => {
  const user = await userService.addNewUser(req.body);
  await refillTokens(user.toJSON().id);
  const id = Number(user.toJSON().id);

  await userService.decrementeTokens(id, 10);

  res.json(toUserDTO(user.toJSON()));
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken, user } = await userService.loginUser(
    email,
    password,
  );
  await refillTokens(user.toJSON().id);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
  });
  const idUser = Number(user.toJSON().id);

  await userService.decrementeTokens(idUser, 5);

  res.json({ accessToken });
};

export const refresh = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  const accessToken = userService.refreshAccessToken(token);

  res.json({ accessToken });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');

  res.json({ message: 'Logged out' });
};
