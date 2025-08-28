const express = require("express");
const {
  createCategoryController,
  deleteCategoryController,
  getAllCategoryController,
  getCategoryTemplateController,
} = require("../controllers/categoryController");
const categoryRoute = express.Router();

// create category
categoryRoute.post("/create-category", createCategoryController);

// delete category
categoryRoute.delete("/delete-category/:id", deleteCategoryController);

//get all category
categoryRoute.get("/allCategory", getAllCategoryController);

//get category template
categoryRoute.get(
  "/category-template/:category_id",
  getCategoryTemplateController
);

module.exports = categoryRoute;
