const userService = require("../services/user.service.js");
const { toUserDTO } = require("../util/user.dto");


exports.getUsers = (req, res) => {
  const users = userService.getAllUsers();
  res.json(toUserDTO(users));
};

exports.getUser =(req,res) => {
    const user =userService.getUserById(req.params.id);
    res.json(toUserDTO(user));
}

exports.updateUser =(req,res) => {
    const user =userService.updateUserById(req.params.id ,req.body);
    res.json(toUserDTO(user));
}

exports.deleteUser = (req, res) => {
    const result = userService.deleteUserById(req.params.id);
    res.json();
};



