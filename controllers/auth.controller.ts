import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { toUserDTO } from '../util/user.dto';
import { logger } from '../util/logger';
export const addUser = (req: Request, res: Response): void => {
  const user = userService.addNewUser(req.body);
  res.json(toUserDTO(user));
  logger.info('User created', { email: user.email });
};
