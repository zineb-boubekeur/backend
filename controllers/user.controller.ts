import * as userService from '../services/user.service';
import { toUserDTO } from '../util/user.dto';
import { Request, Response } from 'express';

export const getUsers = (req: Request, res: Response) => {
  const users = userService.getAllUsers();

  const safeUsers = users.map((user) => toUserDTO(user));

  res.json(safeUsers);
};

export const getUser = (req: Request, res: Response) => {
  const user = userService.getUserById(req.params.id as string);
  res.json(toUserDTO(user));
};

export const updateUser = (req: Request, res: Response) => {
  const user = userService.updateUserById(req.params.id as string, req.body);
  res.json(toUserDTO(user));
};

export const deleteUser = (req: Request, res: Response) => {
  userService.deleteUserById(req.params.id as string);
  res.json();
};
