const express = require("express");
const featureRoute = express.Router();
const productFeaturesController = require("../controllers/productFeaturesController");

// Create a new product feature
featureRoute.post('/product/feature/create', productFeaturesController.createProductFeature);

// Update a product feature
featureRoute.patch('/product/feature/update/:id', productFeaturesController.updateProductFeature);

// Delete a product feature
featureRoute.delete('/product/feature/delete/:id', productFeaturesController.deleteProductFeature);

// Get all product features
featureRoute.get('/product/feature/all', productFeaturesController.getAllProductFeatures);

//get product by id
featureRoute.get('/product/features/:id',productFeaturesController.getProductFeatureById)

module.exports = featureRoute;
