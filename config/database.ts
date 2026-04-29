import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  'backend_db', // nom DB
  'postgres', // user postgres
  '@Zinebzineb27', // password
  {
    host: 'db',
    dialect: 'postgres',
    logging: false,
    retry: {
      max: 5,
    },
  },
);
