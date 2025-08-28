const express = require("express");
const {
  insertSubscriptionDetailsController,
  getAllSubscriptionsDetailsController,
  getAllSubscriptionDetailsForOneUserController,
} = require("../controllers/subscribeController");

const subscribeRoute = express.Router();

//insert and create subscription data
subscribeRoute.post(
  "/user/:id/subscriptions", insertSubscriptionDetailsController
);

//for get all subscribe data
subscribeRoute.get("/subscriptions", getAllSubscriptionsDetailsController);

//get data for specific user 
subscribeRoute.get('/subscription/:id',getAllSubscriptionDetailsForOneUserController)

module.exports = subscribeRoute;
