const express = require("express");
const isLoggedIn = require("../policies/isLoggedIn");
const UserController = require("../controllers/UserController");
const AuthController = require("../controllers/AuthController");

const userController = new UserController();
const authController = new AuthController();

const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/register", isLoggedIn, userController.create);

module.exports = authRouter;
