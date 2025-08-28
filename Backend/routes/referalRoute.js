const express = require("express");
const { getReferUserController } = require("../controllers/referController");
const authenticateToken = require("../middleware/authMiddleware");

const referRoute = express.Router();

referRoute.get("/referedUser", getReferUserController, authenticateToken);

module.exports = referRoute;
