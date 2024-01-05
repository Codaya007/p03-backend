const express = require("express");
const isLoggedIn = require("../policies/isLoggedIn");
const UserController = require("../controllers/UserController");

const userController = new UserController();
const userRouter = express.Router();

// Los users solo se pueden leer y crear, no eliminar ni editar
// Solo los generentes de la empresa pueden acceder a estos servicios
userRouter.get("/", isLoggedIn, userController.list);

userRouter.get("/:external_id", isLoggedIn, userController.getById);

userRouter.patch("/:external_id", isLoggedIn, userController.update);

// userRouter.post("/", userController.create);

module.exports = userRouter;
