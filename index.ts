import express, { Application } from 'express';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import { Request, Response } from 'express';
import { notFound, errorHandler } from './middlewares/error.middleware';

import { logger } from './util/logger';
const app: Application = express();

console.log('auth file imported');

app.use(express.json());

// routes
app.use('/api', userRoutes);
app.use('/api', authRoutes);

// route test
app.get('/', (req: Request, res: Response) => {
  res.send('API OK ');
});

logger.info('Server starting...');

// routes inconnues (404)
app.use(notFound);

app.use(errorHandler);

app.listen(3000, () => {
  logger.info('Server running');
});
