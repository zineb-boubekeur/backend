import * as userService from '../services/user.service';
import { toUserDTO } from '../util/user.dto';
import { Request, Response } from 'express';
export { tsUser } from '../services/user.service';

export const getUsers = async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();

  const safeUsers = users.map((user) => toUserDTO(user.toJSON()));

  res.json(safeUsers);
};

export const getUser = async (req: Request, res: Response) => {
  const user = await userService.getUserById(Number(req.params.id));
  res.json(toUserDTO(user));
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await userService.updateUser(Number(req.params.id), req.body);
  res.json(toUserDTO(user.toJSON()));
};

export const deleteUser = async (req: Request, res: Response) => {
  await userService.deleteUserById(Number(req.params.id));
  res.json();
};
