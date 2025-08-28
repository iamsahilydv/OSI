const express = require("express");
const {
  saveItemCartController,
  getItemCartController,
  removeItemCartController,
  updateCartItemQtyController,
  getParticularUserCartItemController,
} = require("../controllers/cartController");
const authenticateToken = require("../middleware/authMiddleware");

const cartRouter = express.Router();

cartRouter.post("/cart/items", authenticateToken, saveItemCartController);

cartRouter.get("/cart/items", getItemCartController);

cartRouter.get(
  "/cart/items/:userId",
  authenticateToken,
  getParticularUserCartItemController
);

cartRouter.delete(
  "/remove/cart/items/:cart_id",
  authenticateToken,
  removeItemCartController
);

cartRouter.patch(
  "/update/cart/item/qty/:itemId",
  authenticateToken,
  updateCartItemQtyController
);

module.exports = cartRouter;
