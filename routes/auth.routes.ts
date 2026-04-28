import express, { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { createUserSchema } from '../schemas/auth.schema';
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

export default router;
