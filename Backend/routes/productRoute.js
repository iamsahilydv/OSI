const express = require("express");
const {
  registerProductController,
  updateProductController,
  getAllProductsController,
  deleteProductController,
  getImageController,
  searchProductsController,
  getProductByIdController,
  registerPodProductController,
  getProductRecommendations,
} = require("../controllers/productController");
const authenticateToken = require("../middleware/authMiddleware");

const productRouter = express.Router();

// get all products
productRouter.get("/products", getAllProductsController);

//get product by its id
productRouter.get("/products/:pid", getProductByIdController);

//search product with parial match
productRouter.post("/search-product", searchProductsController);

//serve the img
productRouter.get("/images/:imageName", getImageController);

//for generate product into database
productRouter.post(
  "/register-product",
  authenticateToken,
  registerProductController
);

//get product recommendations for a single product page
productRouter.get("/products/:pid/recommendations", getProductRecommendations);

//delete a particular product
productRouter.delete(
  "/delete-product",
  authenticateToken,
  deleteProductController
);

//update product
productRouter.patch(
  "/update-product",
  authenticateToken,
  updateProductController
);

module.exports = productRouter;
