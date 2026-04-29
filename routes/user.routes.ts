import express, { Router } from 'express';
const router: Router = express.Router();
import { validate } from '../middlewares/validate';
import { updateUserSchema } from '../schemas/auth.schema';

import * as userController from '../controllers/user.controller';
import { authMiddleware, authorizeUser } from '../middlewares/auth.middleware';

router.get('/users', authMiddleware, userController.getUsers);
router.get('/users/:id', authMiddleware, userController.getUser);
router.put(
  '/users/:id',
  authMiddleware,
  authorizeUser,
  validate(updateUserSchema),
  userController.updateUser,
);
router.delete(
  '/users/:id',
  authMiddleware,
  authorizeUser,
  userController.deleteUser,
);

export default router;
