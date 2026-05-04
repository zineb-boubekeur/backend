import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import { notFound, errorHandler } from './middlewares/error.middleware';
import locationRoutes from './routes/location.routes';
import './models/location'; // ← pour que Sequelize crée la table

const app: Application = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api', userRoutes);
app.use('/api', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('API OK');
});

app.use('/api', locationRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
