import express, { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { createUserSchema } from '../schemas/auth.schema';
import { login, refresh, logout } from '../controllers/auth.controller';
const router: Router = express.Router();

// REGISTER
router.post(
  '/auth/register',
  (req, res, next) => {
    console.log('ROUTE HIT');
    next();
  }, // ← test
  validate(createUserSchema),
  authController.addUser,
);

router.post('/auth/login', login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);

export default router;
