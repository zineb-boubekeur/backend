import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  'backend_db', // nom DB
  'postgres', // user postgres
  '@Zinebzineb27', // password
  {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
    retry: {
      max: 5,
    },
  },
);
