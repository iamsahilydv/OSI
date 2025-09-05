const express = require("express");

const {
  addTransaction,
  updateTransaction,
  allSuccessTransaction,
  allPendingTransaction,
  getPendingTransactionByUser,
  getSuccessTransactionByUser,
  getTurnover,
  getTodaysTransaction,
  getAllTransactionController,
  getTransactionByUserController,
  createWithdrawalController,
  getAllWithdrawalController,
  getUserWithdrawalController,
} = require("../controllers/transactionController");
const authenticateToken = require("../middleware/authMiddleware");
const Transactionrouter = express.Router();

Transactionrouter.post(
  "/addTransaction/:id",
  authenticateToken,
  addTransaction
);
Transactionrouter.patch(
  "/updateTransaction/:id",
  authenticateToken,
  updateTransaction
);
Transactionrouter.get(
  "/getSuccessTransaction",
  authenticateToken,
  allSuccessTransaction
);
Transactionrouter.get(
  "/getPendingTransaction",
  authenticateToken,
  allPendingTransaction
);
Transactionrouter.get(
  "/getPendingTransaction/:id",
  authenticateToken,
  getPendingTransactionByUser
);
Transactionrouter.get(
  "/getSuccessTransaction/:id",
  authenticateToken,
  getSuccessTransactionByUser
);
Transactionrouter.get(
  "/getTodaysTransaction/:id",
  authenticateToken,
  getTodaysTransaction
);

Transactionrouter.get("/getTurnover/:id", authenticateToken, getTurnover);
Transactionrouter.get(
  `/getAllTransaction`,
  authenticateToken,
  getAllTransactionController
);
Transactionrouter.get(
  `/getUserTransaction`,
  authenticateToken,
  getTransactionByUserController
);

Transactionrouter.post(
  `/createWithdrawal`,
  authenticateToken,
  createWithdrawalController
);
Transactionrouter.get(
  `/getAllWithdrawal`,
  authenticateToken,
  getAllWithdrawalController
);
Transactionrouter.get(
  `/getUserWithdrawal`,
  authenticateToken,
  getUserWithdrawalController
);
module.exports = Transactionrouter;
