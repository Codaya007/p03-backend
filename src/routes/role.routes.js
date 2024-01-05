const express = require("express");
const isLoggedIn = require("../policies/isLoggedIn");
const RoleController = require("../controllers/RoleController");
const roleController = new RoleController();

const roleRouter = express.Router();

// Los roles solo se pueden leer y crear, no eliminar ni editar
// Solo los generentes de la empresa pueden acceder a estos servicios
roleRouter.get("/", isLoggedIn, roleController.list);

roleRouter.get("/:external_id", isLoggedIn, roleController.getById);

roleRouter.post("/", roleController.create);

module.exports = roleRouter;
