import * as userService from '../services/user.service';

export type UserSafe = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
};
export const toUserDTO = (user: userService.User): UserSafe => {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
};
