const express = require("express");
const isLoggedIn = require("../policies/isLoggedIn");
const PurchaseController = require("../controllers/PurchaseController");
const validateRole = require("../policies/validateRole");
const { VENDEDOR_ROLE_NAME } = require("../constants");
const purchaseController = new PurchaseController();

const purchaseRouter = express.Router();

purchaseRouter.get("/", isLoggedIn, purchaseController.list);

purchaseRouter.post("/", isLoggedIn, purchaseController.create);

// Servicios para el vendedor
purchaseRouter.get(
  "/sold-books",
  isLoggedIn,
  validateRole(VENDEDOR_ROLE_NAME),
  purchaseController.listQuincena
);

purchaseRouter.get("/:external_id", isLoggedIn, purchaseController.getById);

purchaseRouter.get(
  "/bySeller/:external_id",
  isLoggedIn,
  purchaseController.listBySeller
);

module.exports = purchaseRouter;
