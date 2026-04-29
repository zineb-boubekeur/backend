import { tsUser } from '../services/user.service';

export type UserSafe = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
};
export const toUserDTO = (user: tsUser): UserSafe => {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
};
