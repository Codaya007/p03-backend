const express = require("express");
const isLoggedIn = require("../policies/isLoggedIn");
const DocumentController = require("../controllers/DocumentController");
const documentController = new DocumentController();

const documentRouter = express.Router();

documentRouter.get("/", isLoggedIn, documentController.list);

documentRouter.get("/:external_id", isLoggedIn, documentController.getById);

documentRouter.patch("/:external_id", isLoggedIn, documentController.update);

documentRouter.delete("/:external_id", isLoggedIn, documentController.remove);

documentRouter.post("/", documentController.create);

module.exports = documentRouter;
