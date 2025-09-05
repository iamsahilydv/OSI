const express = require("express");
const customerReviewRoute = express.Router();
const customerReviewsController = require("../controllers/customerReviwsController");

// Create a new customer review
customerReviewRoute.post('/create-review', customerReviewsController.createCustomerReviewController);

// Get a customer review by ID
customerReviewRoute.get('/get-review/:id', customerReviewsController.updateCustomerReviewController);

// Update a customer review
customerReviewRoute.patch('/update-review/:id', customerReviewsController.updateCustomerReviewController);

// Delete a customer review
customerReviewRoute.delete('/delete-review/:id', customerReviewsController.deleteCustomerReviewController);

module.exports = customerReviewRoute;
