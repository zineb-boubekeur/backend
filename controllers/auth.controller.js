const userService = require("../services/user.service.js");

const { toUserDTO } = require("../util/user.dto");



//console.log("REGISTER HIT");
exports.addUser = (req, res, next) => {
    const user = userService.addNewUser(req.body);
    res.json(toUserDTO(user));
};