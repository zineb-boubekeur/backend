import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user';
import bcrypt from 'bcrypt';
import { NextFunction } from 'express';

jest.mock('../../models/user');
jest.mock('bcrypt');
jest.mock('../../util/jwt', () => ({
  generateAccessToken: jest.fn().mockReturnValue('access_token'),
  generateRefreshToken: jest.fn().mockReturnValue('refresh_token'),
}));

jest.mock('../../middlewares/auth.middleware', () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    req.user = { id: 1, email: 'zineb@test.com' };
    next();
  },
  authorizeUser: (req: Request, res: Response, next: NextFunction) => next(),
}));

const mockUser = {
  id: 1,
  firstName: 'Zineb',
  lastName: 'Boubekeur',
  email: 'zineb@test.com',
  password: 'hashed_password',
  age: 21,
  nbTokens: 20,
  lastTokenUpdate: new Date(Date.now() - 120000),
  toJSON: () => ({
    id: 1,
    firstName: 'Zineb',
    lastName: 'Boubekeur',
    email: 'zineb@test.com',
    age: 21,
    nbTokens: 20,
    lastTokenUpdate: new Date(Date.now() - 120000),
  }),
  update: jest.fn(),
  decrement: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('USER + AUTH INTEGRATION TESTS', () => {
  // ─── REGISTER ───────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register user and return tokens', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      mockUser.decrement.mockResolvedValue(mockUser);

      const res = await request(app).post('/api/auth/register').send({
        firstName: 'Zineb',
        lastName: 'Boubekeur',
        email: 'zineb@test.com',
        password: 'Test12345',
        age: 21,
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid', password: '123' });

      expect(res.status).toBe(400);
    });

    it('should return 400 if body is empty', async () => {
      const res = await request(app).post('/api/auth/register').send({});

      expect(res.status).toBe(400);
    });
  });

  // ─── LOGIN ──────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      mockUser.decrement.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'zineb@test.com', password: 'Test12345' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      // refreshToken est dans le cookie HTTP-only
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('refreshToken');
    });

    it('should return 401 if user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'Test12345' });

      expect(res.status).toBe(401);
    });

    it('should return 401 if password is wrong', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'zineb@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
    });
  });

  // ─── GET USERS ──────────────────────────────────────────────
  describe('GET /api/users', () => {
    it('should return users list', async () => {
      (User.findAll as jest.Mock).mockResolvedValue([mockUser]);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ─── GET USER BY ID ─────────────────────────────────────────
  describe('GET /api/users/:id', () => {
    it('should return one user', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).get('/api/users/1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBeDefined();
    });

    it('should return 404 if not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/users/999');

      expect(res.status).toBe(404);
    });
  });

  // ─── UPDATE USER ────────────────────────────────────────────
  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      mockUser.update.mockResolvedValue(mockUser);

      const res = await request(app)
        .put('/api/users/1')
        .send({ firstName: 'Updated' });

      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/users/999')
        .send({ firstName: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE USER ────────────────────────────────────────────
  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (User.destroy as jest.Mock).mockResolvedValue(1);

      const res = await request(app).delete('/api/users/1');

      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/users/999');

      expect(res.status).toBe(404);
    });
  });

  // ─── 404 ROUTE ──────────────────────────────────────────────
  describe('Unknown route', () => {
    it('should return 404 for unknown route', async () => {
      const res = await request(app).get('/api/unknown');
      expect(res.status).toBe(404);
    });
  });
});
