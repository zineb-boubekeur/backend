const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller.js");

// REGISTER
router.post("/auth/register", authController.addUser);



module.exports = router;