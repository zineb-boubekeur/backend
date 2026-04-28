import express, { Router } from 'express';
const router: Router = express.Router();
import { validate } from '../middlewares/validate';
import { updateUserSchema } from '../schemas/auth.schema';

import * as userController from '../controllers/user.controller';

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUser);
router.put('/users/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

export default router;
