const express = require("express");
const {
  getAllOrdersController,
  createOrderController,
  getSingleOrdersController,
  updateOrderController,
  getOrderAdminPanel,
} = require("../controllers/orderController");
const authenticateToken = require("../middleware/authMiddleware");

const orderRouter = express.Router();

//get all order details related to anyone special
orderRouter.get("/getAllOrder", authenticateToken, getAllOrdersController);
orderRouter.get("/getAllOrderAdmin", authenticateToken, getOrderAdminPanel);

// get all orders by orderId

orderRouter.get(
  "/getAllOrder/:orderId",
  authenticateToken,
  getSingleOrdersController
);

// update order delivered status
orderRouter.patch(
  "/updateOrder/:orderId",
  authenticateToken,
  updateOrderController
);

//register order details
orderRouter.post("/makeOrder", authenticateToken, createOrderController);

module.exports = orderRouter;
