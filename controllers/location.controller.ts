import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as locationService from '../services/location.service';

export const getLocations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const locations = await locationService.getLocationsByUser(userId);
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createLocation = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const location = await locationService.addLocation(req.body, userId);
    res.status(201).json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
