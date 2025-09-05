const express = require("express");
const priceRoute = express.Router();
const pricesController = require("../controllers/priceController");

// Create a new price
priceRoute.post("/create-price", pricesController.createPriceController);

// Get a price by ID
priceRoute.get("/get-price/:id", pricesController.getPriceController);

// Update a price
priceRoute.put("/update-price/:id", pricesController.updatePriceController);

// Delete a price
priceRoute.delete("/delete-price/:id", pricesController.deletePriceController);

module.exports = priceRoute;
