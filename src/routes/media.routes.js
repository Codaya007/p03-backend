const express = require("express");
const isLoggedIn = require("../policies/isLoggedIn");
const MediaController = require("../controllers/MediaController");

const mediaController = new MediaController();

const mediaRouter = express.Router();

mediaRouter.post("/upload", isLoggedIn, mediaController.save);

module.exports = mediaRouter;
