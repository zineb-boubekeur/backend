import express, { Application } from 'express';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import { Request, Response } from 'express';
import { notFound, errorHandler } from './middlewares/error.middleware';
import { sequelize } from './config/database';
import './models/user';
import cookieParser from 'cookie-parser';

import { logger } from './util/logger';
import dotenv from 'dotenv';
dotenv.config();
console.log('DB_HOST:', process.env.DB_HOST); // ← que vois-tu ?

const app: Application = express();

console.log('auth file imported');

app.use(express.json());
app.use(cookieParser());
// routes
app.use('/api', userRoutes);
app.use('/api', authRoutes);

// route test
app.get('/', (req: Request, res: Response) => {
  res.send('API OK ');
});

logger.info('Server starting...');

sequelize
  .authenticate()
  .then(() => console.log('DB connected'))
  .catch((err) => console.error('DB error', err));

sequelize
  .sync({ alter: true })
  .then(() => console.log('Tables created'))
  .catch((err) => console.error(err));

// routes inconnues (404)
app.use(notFound);

app.use(errorHandler);

console.log('About to listen on port 3000...');
app.listen(3000, () => {
  logger.info('Server running');
});
console.log('Listen called');
