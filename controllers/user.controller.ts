import * as userService from '../services/user.service';
import { toUserDTO } from '../util/user.dto';
import { Request, Response } from 'express';
export { tsUser } from '../services/user.service';

export interface AuthRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

export const getUsers = async (req: AuthRequest, res: Response) => {
  const users = await userService.getAllUsers();
  const idUser = Number(req.user?.id);
  userService.incrementeTokens(idUser, 1);

  const safeUsers = users.map((user) => toUserDTO(user.toJSON()));

  res.json(safeUsers);
};

export const getUser = async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserById(Number(req.params.id));
  const idUser = Number(req.user?.id);
  userService.incrementeTokens(idUser, 1);

  res.json(toUserDTO(user));
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const user = await userService.updateUser(Number(req.params.id), req.body);
  const idUser = Number(req.user?.id);
  userService.incrementeTokens(idUser, 2);
  res.json(toUserDTO(user.toJSON()));
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  await userService.deleteUserById(Number(req.params.id));
  const idUser = Number(req.user?.id);
  userService.incrementeTokens(idUser, 3);
  res.json();
};
