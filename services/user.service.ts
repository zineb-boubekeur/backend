import fs from 'fs';
import bcrypt from 'bcrypt';

export type HttpError = Error & {
  status?: number;
};

const filePath = './data/users.json';

export type User = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
};

export const getAllUsers = (): User[] => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

export const getUserById = (id: string): User => {
  const users: User[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const user = users.find((u) => u.id === id);

  if (!user) {
    const error: HttpError = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return user;
};

export const updateUserById = (id: string, dataUpdate: User) => {
  const users: User[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex == -1) {
    const error: HttpError = new Error('User not found');
    error.status = 404;
    throw error;
  }

  //  if (dataUpdate.name) users[userIndex].name = dataUpdate.name;
  if (dataUpdate.age) users[userIndex].age = dataUpdate.age;
  if (dataUpdate.email) users[userIndex].email = dataUpdate.email;
  if (dataUpdate.firstName) users[userIndex].firstName = dataUpdate.firstName;
  if (dataUpdate.lastName) users[userIndex].lastName = dataUpdate.lastName;
  if (dataUpdate.password) users[userIndex].password = dataUpdate.password;

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

  return users[userIndex];
};

export const addNewUser = (userData: User) => {
  const { firstName, lastName, email, password, age } = userData;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!age || !email || !lastName || !password || !firstName) {
    const error: HttpError = new Error('All fields are required');
    error.status = 400;
    throw error;
  }
  const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const lastUser = users[users.length - 1];
  const newId = lastUser ? Number(lastUser.id) + 1 : 1;
  const newUser = {
    id: newId.toString(),
    age: userData.age,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    password: hashedPassword,
  };

  users.push(newUser);

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

  return newUser;
};

export const deleteUserById = (id: string) => {
  const users: User[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    const error: HttpError = new Error('User not found');
    error.status = 404;
    throw error;
  }

  users.splice(userIndex, 1);

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};
