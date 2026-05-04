import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { sequelize } from './config/database';
import './models/user';
import { logger } from './util/logger';

logger.info('Server starting...');

sequelize
  .authenticate()
  .then(() => console.log('DB connected'))
  .catch((err) => console.error('DB error', err));

sequelize
  .sync({ alter: true })
  .then(() => console.log('Tables created'))
  .catch((err) => console.error(err));

app.listen(3000, () => {
  logger.info('Server running on port 3000');
});
