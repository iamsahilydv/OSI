const express = require("express");
const { stageControler } = require("../controllers/stagesControler");

const stageRoute = express.Router();

stageRoute.get("/stage/:user_id", stageControler);

module.exports = stageRoute;
