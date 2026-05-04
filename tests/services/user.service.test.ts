/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';
import { User } from '../../models/user';
import { AppError } from '../../middlewares/error.middleware';
import * as jwtUtil from '../../util/jwt';
import {
  getAllUsers,
  getUserById,
  addNewUser,
  deleteUserById,
  loginUser,
  updateUser,
  decrementeTokens,
  refillTokens,
} from '../../services/user.service';

// Mock des dépendances
jest.mock('../../models/user');
jest.mock('bcrypt');
jest.mock('../../util/jwt');

const mockUser = {
  id: 1,
  firstName: 'Zineb',
  lastName: 'Boubekeur',
  email: 'zineb@test.com',
  password: 'hashed_password',
  age: 21,
  nbTokens: 20,
  lastTokenUpdate: new Date(Date.now() - 120000), // 2 minutes ago
  toJSON: () => ({
    id: 1,
    firstName: 'Zineb',
    lastName: 'Boubekeur',
    email: 'zineb@test.com',
    password: 'hashed_password',
    age: 21,
    nbTokens: 20,
    lastTokenUpdate: new Date(Date.now() - 120000),
  }),
  update: jest.fn(),
  decrement: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (jwtUtil.generateAccessToken as jest.Mock).mockReturnValue('access_token');
  (jwtUtil.generateRefreshToken as jest.Mock).mockReturnValue('refresh_token');
});

// ─── getAllUsers ───────────────────────────────────────────────
describe('getAllUsers', () => {
  it('should return all users', async () => {
    (User.findAll as jest.Mock).mockResolvedValue([mockUser]);
    const result = await getAllUsers();
    expect(result).toEqual([mockUser]);
    expect(User.findAll).toHaveBeenCalledTimes(1);
  });
});

// ─── getUserById ───────────────────────────────────────────────
describe('getUserById', () => {
  it('should return user if found', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    const result = await getUserById(1);
    expect(result).toEqual(mockUser.toJSON());
  });

  it('should throw 404 if user not found', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(getUserById(999)).rejects.toMatchObject({ status: 404 });
  });
});

// ─── addNewUser ────────────────────────────────────────────────
describe('addNewUser', () => {
  it('should create user and return tokens', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (User.create as jest.Mock).mockResolvedValue(mockUser);

    const result = await addNewUser({
      id: 0,
      firstName: 'Zineb',
      lastName: 'Boubekeur',
      email: 'zineb@test.com',
      password: 'Test12345',
      age: 21,
      nbTokens: 20,
    });

    expect(result).toHaveProperty('accessToken', 'access_token');
    expect(result).toHaveProperty('refreshToken', 'refresh_token');
    expect(result).toHaveProperty('user');
    expect(bcrypt.hash).toHaveBeenCalledWith('Test12345', 10);
  });

  it('should throw error if email already exists', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (User.create as jest.Mock).mockRejectedValue(new UniqueConstraintError({}));

    await expect(
      addNewUser({
        id: 0,
        firstName: 'Zineb',
        lastName: 'Boubekeur',
        email: 'zineb@test.com',
        password: 'Test12345',
        age: 21,
        nbTokens: 20,
      }),
    ).rejects.toThrow('Email already exists, please use another email');
  });
});

// ─── loginUser ─────────────────────────────────────────────────
describe('loginUser', () => {
  it('should throw 401 if user not found', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    await expect(loginUser('wrong@test.com', '123456')).rejects.toMatchObject({
      status: 401,
    });
  });

  it('should throw 401 if password is invalid', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(loginUser('zineb@test.com', 'wrong')).rejects.toMatchObject({
      status: 401,
    });
  });

  it('should return tokens if credentials are valid', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await loginUser('zineb@test.com', 'Test12345');
    expect(result).toHaveProperty('accessToken', 'access_token');
    expect(result).toHaveProperty('refreshToken', 'refresh_token');
    expect(result).toHaveProperty('user');
  });
});

// ─── deleteUserById ────────────────────────────────────────────
describe('deleteUserById', () => {
  it('should delete user if found', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (User.destroy as jest.Mock).mockResolvedValue(1);

    const result = await deleteUserById(1);
    expect(result).toBe(1);
    expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw 404 if user not found', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(deleteUserById(999)).rejects.toBeInstanceOf(AppError);
  });
});

// ─── updateUser ────────────────────────────────────────────────
describe('updateUser', () => {
  it('should update and return user', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    mockUser.update.mockResolvedValue(mockUser);

    const result = await updateUser(1, mockUser.toJSON() as any);
    expect(mockUser.update).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should throw 404 if user not found', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(
      updateUser(999, mockUser.toJSON() as any),
    ).rejects.toMatchObject({
      status: 404,
    });
  });
});

// ─── decrementeTokens ──────────────────────────────────────────
describe('decrementeTokens', () => {
  it('should decrement tokens', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    mockUser.decrement.mockResolvedValue(mockUser);

    await decrementeTokens(1, 5);
    expect(mockUser.decrement).toHaveBeenCalledWith('nbTokens', { by: 5 });
  });

  it('should throw 404 if user not found', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(decrementeTokens(999, 5)).rejects.toBeInstanceOf(AppError);
  });

  it('should throw 400 if not enough tokens', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue({
      ...mockUser,
      nbTokens: 3,
    });
    await expect(decrementeTokens(1, 5)).rejects.toMatchObject({ status: 400 });
  });
});

// ─── refillTokens ──────────────────────────────────────────────
describe('refillTokens', () => {
  it('should refill tokens based on elapsed time', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (User.update as jest.Mock).mockResolvedValue([1]);

    const result = (await refillTokens(1)) as any;
    expect(User.update).toHaveBeenCalled();
    expect(result.nbTokens).toBeGreaterThanOrEqual(mockUser.nbTokens);
  });

  it('should not refill if less than 1 minute elapsed', async () => {
    const recentUser = {
      ...mockUser,
      lastTokenUpdate: new Date(), // maintenant
      toJSON: () => ({ ...mockUser.toJSON(), lastTokenUpdate: new Date() }),
    };
    (User.findByPk as jest.Mock).mockResolvedValue(recentUser);

    await refillTokens(1);
    expect(User.update).not.toHaveBeenCalled();
  });

  it('should throw 404 if user not found', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(refillTokens(999)).rejects.toBeInstanceOf(AppError);
  });
});
