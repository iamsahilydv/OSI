// const express = require("express");
// const {
//   registerProductController,
//   updateProductController,
//   getAllProductsController,
//   deleteProductController,
//   getImageController,
//   searchProductsController,
//   getProductByIdController,
//   registerPodProductController,
//   getProductRecommendations,
// } = require("../controllers/productController");
// const authenticateToken = require("../middleware/authMiddleware");

// const productRouter = express.Router();

// // get all products
// productRouter.get("/products", getAllProductsController);

// //get product by its id
// productRouter.get("/products/:pid", getProductByIdController);

// //search product with parial match
// productRouter.post("/search-product", searchProductsController);

// //serve the img
// productRouter.get("/images/:imageName", getImageController);

// //for generate product into database
// productRouter.post(
//   "/register-product",
//   authenticateToken,
//   registerProductController
// );

// //get product recommendations for a single product page
// productRouter.get("/products/:pid/recommendations", getProductRecommendations);

// //delete a particular product
// productRouter.delete(
//   "/delete-product",
//   authenticateToken,
//   deleteProductController
// );

// //update product
// productRouter.patch(
//   "/update-product",
//   authenticateToken,
//   updateProductController
// );

// module.exports = productRouter;

// Enhanced API Routes for Professional Product Management
const express = require("express");
const router = express.Router();

// Import Controllers
const {
  registerProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  searchProductsController,
  getProductRecommendations,
  getProductAnalyticsController,
  duplicateProductController,
  bulkImportProductsController,
  bulkUpdateProductsController,
} = require("../controllers/productController");

const {
  addCategoryAttributeController,
  getCategoryAttributesController,
  updateCategoryAttributeController,
  deleteCategoryAttributeController,
  getAllCategoryAttributesController,
} = require("../controllers/categoryAttributesController");

const {
  createCategoryController,
  getAllCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getCategoryTemplateController,
} = require("../controllers/categoryController");

const {
  createSupplierController,
  getAllSuppliersController,
  getSupplierByIdController,
  updateSupplierController,
  deleteSupplierController,
  syncSupplierProductsController,
  getSupplierAnalyticsController,
} = require("../controllers/supplierController");

const {
  addToCartController,
  getCartItemsController,
  updateCartItemQuantityController,
  removeCartItemController,
  clearCartController,
  validateCartController,
} = require("../controllers/cartController");

// Import additional controllers that were referenced but not imported
const {
  getProductVariationsController,
  getVariationByIdController,
  createVariationController,
  updateVariationController,
  deleteVariationController,
} = require("../controllers/variationController");

const {
  getVariationPricesController,
  createPriceController,
  updatePriceController,
  deletePriceController,
  bulkUpdatePricingController,
} = require("../controllers/pricingController");

const {
  uploadProductImagesController,
  uploadVariationImagesController,
  deleteImageController,
  updateImageController,
} = require("../controllers/imageController");

const {
  getInventoryController,
  getLowStockController,
  updateStockController,
  bulkUpdateStockController,
  getStockAlertsController,
} = require("../controllers/inventoryController");

const {
  getSalesAnalyticsController,
  getCategoryAnalyticsController,
  getInventoryAnalyticsController,
  generateCustomReportController,
  getReportController,
} = require("../controllers/analyticsController");

const {
  getSearchSuggestionsController,
  getCategoryFiltersController,
  getAttributeFiltersController,
} = require("../controllers/searchController");

const {
  importProductsController,
  exportProductsController,
  getImportTemplateController,
} = require("../controllers/importExportController");

// Middleware for authentication and validation
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validateRequestMiddleware = require("../middleware/validateRequest");

// Database connection utility
const { createConnectionDb } = require("../utils/database");

// ===========================
// PRODUCT ROUTES
// ===========================

// Public product routes
router.get("/products", getAllProductsController);
router.get("/products/:pid", getProductByIdController);
router.get("/products/:pid/recommendations", getProductRecommendations);
router.post("/products/search", searchProductsController);

// Protected product routes (require authentication)
router.post(
  "/products",
  authMiddleware,
  adminMiddleware,
  validateRequestMiddleware("createProduct"),
  registerProductController
);
router.put(
  "/products/:pid",
  authMiddleware,
  adminMiddleware,
  updateProductController
);
router.delete(
  "/products/:pid",
  authMiddleware,
  adminMiddleware,
  deleteProductController
);

// Advanced product routes
router.get(
  "/products/:pid/analytics",
  authMiddleware,
  adminMiddleware,
  getProductAnalyticsController
);
router.post(
  "/products/:pid/duplicate",
  authMiddleware,
  adminMiddleware,
  duplicateProductController
);
router.post(
  "/products/bulk-import",
  authMiddleware,
  adminMiddleware,
  bulkImportProductsController
);
router.post(
  "/products/bulk-update",
  authMiddleware,
  adminMiddleware,
  bulkUpdateProductsController
);

// ===========================
// CATEGORY ROUTES
// ===========================

// Public category routes
router.get("/categories", getAllCategoryController);
router.get("/categories/:category_id/template", getCategoryTemplateController);
router.get(
  "/categories/:category_id/attributes",
  getCategoryAttributesController
);

// Protected category routes
router.post(
  "/categories",
  authMiddleware,
  adminMiddleware,
  validateRequestMiddleware("createCategory"),
  createCategoryController
);
router.put(
  "/categories/:id",
  authMiddleware,
  adminMiddleware,
  updateCategoryController
);
router.delete(
  "/categories/:id",
  authMiddleware,
  adminMiddleware,
  deleteCategoryController
);

// Category attributes routes
router.post(
  "/categories/:category_id/attributes",
  authMiddleware,
  adminMiddleware,
  addCategoryAttributeController
);
router.put(
  "/categories/attributes/:id",
  authMiddleware,
  adminMiddleware,
  updateCategoryAttributeController
);
router.delete(
  "/categories/attributes/:id",
  authMiddleware,
  adminMiddleware,
  deleteCategoryAttributeController
);
router.get(
  "/categories/attributes",
  authMiddleware,
  adminMiddleware,
  getAllCategoryAttributesController
);

// ===========================
// SUPPLIER ROUTES (Dropshipping)
// ===========================

// Protected supplier routes (admin only)
router.get(
  "/suppliers",
  authMiddleware,
  adminMiddleware,
  getAllSuppliersController
);
router.get(
  "/suppliers/:supplierId",
  authMiddleware,
  adminMiddleware,
  getSupplierByIdController
);
router.post(
  "/suppliers",
  authMiddleware,
  adminMiddleware,
  validateRequestMiddleware("createSupplier"),
  createSupplierController
);
router.put(
  "/suppliers/:supplierId",
  authMiddleware,
  adminMiddleware,
  updateSupplierController
);
router.delete(
  "/suppliers/:supplierId",
  authMiddleware,
  adminMiddleware,
  deleteSupplierController
);

// Supplier analytics and sync
router.get(
  "/suppliers/:supplierId/analytics",
  authMiddleware,
  adminMiddleware,
  getSupplierAnalyticsController
);
router.post(
  "/suppliers/:supplierId/sync",
  authMiddleware,
  adminMiddleware,
  syncSupplierProductsController
);

// ===========================
// CART ROUTES
// ===========================

// Protected cart routes (require user authentication)
router.post(
  "/cart/add",
  authMiddleware,
  validateRequestMiddleware("addToCart"),
  addToCartController
);
router.get("/cart", authMiddleware, getCartItemsController);
router.put(
  "/cart/:cart_id/quantity",
  authMiddleware,
  validateRequestMiddleware("updateCartQuantity"),
  updateCartItemQuantityController
);
router.delete("/cart/:cart_id", authMiddleware, removeCartItemController);
router.delete("/cart", authMiddleware, clearCartController);
router.get("/cart/validate", authMiddleware, validateCartController);

// ===========================
// PRODUCT VARIATION ROUTES
// ===========================

router.get("/products/:pid/variations", getProductVariationsController);
router.get("/variations/:variation_id", getVariationByIdController);
router.post(
  "/products/:pid/variations",
  authMiddleware,
  adminMiddleware,
  createVariationController
);
router.put(
  "/variations/:variation_id",
  authMiddleware,
  adminMiddleware,
  updateVariationController
);
router.delete(
  "/variations/:variation_id",
  authMiddleware,
  adminMiddleware,
  deleteVariationController
);

// ===========================
// PRICING ROUTES
// ===========================

router.get("/variations/:variation_id/prices", getVariationPricesController);
router.post(
  "/variations/:variation_id/prices",
  authMiddleware,
  adminMiddleware,
  createPriceController
);
router.put(
  "/prices/:price_id",
  authMiddleware,
  adminMiddleware,
  updatePriceController
);
router.delete(
  "/prices/:price_id",
  authMiddleware,
  adminMiddleware,
  deletePriceController
);

// Bulk pricing operations
router.post(
  "/products/bulk-pricing",
  authMiddleware,
  adminMiddleware,
  bulkUpdatePricingController
);

// ===========================
// IMAGE MANAGEMENT ROUTES
// ===========================

router.post(
  "/products/:pid/images",
  authMiddleware,
  adminMiddleware,
  uploadProductImagesController
);
router.post(
  "/variations/:variation_id/images",
  authMiddleware,
  adminMiddleware,
  uploadVariationImagesController
);
router.delete(
  "/images/:image_id",
  authMiddleware,
  adminMiddleware,
  deleteImageController
);
router.put(
  "/images/:image_id",
  authMiddleware,
  adminMiddleware,
  updateImageController
);

// ===========================
// INVENTORY MANAGEMENT ROUTES
// ===========================

router.get(
  "/inventory",
  authMiddleware,
  adminMiddleware,
  getInventoryController
);
router.get(
  "/inventory/low-stock",
  authMiddleware,
  adminMiddleware,
  getLowStockController
);
router.put(
  "/variations/:variation_id/stock",
  authMiddleware,
  adminMiddleware,
  updateStockController
);
router.post(
  "/inventory/bulk-update",
  authMiddleware,
  adminMiddleware,
  bulkUpdateStockController
);

// Stock alerts and notifications
router.get(
  "/inventory/alerts",
  authMiddleware,
  adminMiddleware,
  getStockAlertsController
);

// ===========================
// ANALYTICS AND REPORTING ROUTES
// ===========================

router.get(
  "/analytics/products",
  authMiddleware,
  adminMiddleware,
  getProductAnalyticsController
);
router.get(
  "/analytics/sales",
  authMiddleware,
  adminMiddleware,
  getSalesAnalyticsController
);
router.get(
  "/analytics/categories",
  authMiddleware,
  adminMiddleware,
  getCategoryAnalyticsController
);
router.get(
  "/analytics/inventory",
  authMiddleware,
  adminMiddleware,
  getInventoryAnalyticsController
);

// Custom reports
router.post(
  "/reports/custom",
  authMiddleware,
  adminMiddleware,
  generateCustomReportController
);
router.get(
  "/reports/:report_id",
  authMiddleware,
  adminMiddleware,
  getReportController
);

// ===========================
// SEARCH AND FILTER ROUTES
// ===========================

router.post("/search/products", searchProductsController);
router.get("/search/suggestions", getSearchSuggestionsController);
router.get("/filters/categories/:category_id", getCategoryFiltersController);
router.get("/filters/attributes", getAttributeFiltersController);

// ===========================
// IMPORT/EXPORT ROUTES
// ===========================

router.post(
  "/import/products",
  authMiddleware,
  adminMiddleware,
  importProductsController
);
router.post(
  "/export/products",
  authMiddleware,
  adminMiddleware,
  exportProductsController
);
router.get(
  "/import/template/:format",
  authMiddleware,
  adminMiddleware,
  getImportTemplateController
);

// Export the router
module.exports = router;
