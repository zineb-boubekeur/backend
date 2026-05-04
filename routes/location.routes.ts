import express, { Router } from 'express';
import {
  getLocations,
  createLocation,
} from '../controllers/location.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { createLocationSchema } from '../schemas/location.schema';

const router: Router = express.Router();

router.get('/locations', authMiddleware, getLocations);
router.post(
  '/locations',
  authMiddleware,
  validate(createLocationSchema),
  createLocation,
);

export default router;
