import { Location } from '../models/location';
import { AppError } from '../middlewares/error.middleware';
import { CreateLocationInput } from '../schemas/location.schema';

export const getLocationsByUser = async (userId: number) => {
  return await Location.findAll({ where: { userId } });
};

export const addLocation = async (
  data: CreateLocationInput,
  userId: number,
) => {
  if (!userId) throw new AppError(401, 'Unauthorized');
  return await Location.create({ ...data, userId });
};
