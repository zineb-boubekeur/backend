import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  description: z.string().min(1, 'La description est obligatoire'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
