const fs= require ("fs");
const bcrypt = require("bcrypt");


const filePath = "./data/users.json";
exports.getAllUsers= () =>
{
const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

exports.getUserById = (id) => {
    const data = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(data);

    const user = parsedData.find(user => user.id === id);

    if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    return user;
};

exports.updateUserById = (id, dataUpdate) => {
    const users = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex == -1) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    if (dataUpdate.name) users[userIndex].name = dataUpdate.name;
    if (dataUpdate.age) users[userIndex].age = dataUpdate.age;
    if (dataUpdate.email) users[userIndex].email = dataUpdate.email;
    if (dataUpdate.firstName) users[userIndex].firstName = dataUpdate.firstName;
    if (dataUpdate.lastName) users[userIndex].lastName = dataUpdate.lastName;
    if (dataUpdate.password) users[userIndex].password = dataUpdate.password;

    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return users[userIndex];
};



exports.addNewUser = (userData) => {

    const { firstName,lastName ,email ,password,age} = userData;
    const hashedPassword = bcrypt.hashSync(password, 10);
    if (!age || !email || !lastName || !password || !firstName) {
        const error = new Error("All fields are required");
        error.status = 400;
        throw error;
    }    
    const users = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const lastUser = users[users.length - 1];
    const newId = lastUser ? Number(lastUser.id) + 1 : 1;
    const newUser = {
        id: newId.toString(),
        age: userData.age,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password : hashedPassword
    };

    users.push(newUser);

    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return newUser;
};

exports.deleteUserById = (id) => {

    const users = JSON.parse(fs.readFileSync(filePath, "utf-8"));


    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    users.splice(userIndex, 1);


    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));



}