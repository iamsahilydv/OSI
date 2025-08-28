const express = require("express");
const {
  addCategoryAttributeController,
  getCategoryAttributesController,
  updateCategoryAttributeController,
  deleteCategoryAttributeController,
  getAllCategoryAttributesController,
} = require("../controllers/categoryAttributesController");
const authenticateToken = require("../middleware/authMiddleware");

const categoryAttributesRouter = express.Router();

// Get all category attributes (admin only)
categoryAttributesRouter.get(
  "/category-attributes",
  authenticateToken,
  getAllCategoryAttributesController
);

// Get attributes for a specific category
categoryAttributesRouter.get(
  "/category-attributes/:category_id",
  getCategoryAttributesController
);

// Add new category attribute (admin only)
categoryAttributesRouter.post(
  "/category-attributes",
  authenticateToken,
  addCategoryAttributeController
);

// Update category attribute (admin only)
categoryAttributesRouter.patch(
  "/category-attributes/:id",
  authenticateToken,
  updateCategoryAttributeController
);

// Delete category attribute (admin only)
categoryAttributesRouter.delete(
  "/category-attributes/:id",
  authenticateToken,
  deleteCategoryAttributeController
);

module.exports = categoryAttributesRouter;
