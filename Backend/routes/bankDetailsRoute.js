const express = require("express");
const {
  addBankDetails,
  getAllPaymentDetails,
  removeBankDetails,
  addUPIDetails,
  removeUPIDetails,
} = require("../controllers/bankDetailsControler");
const authenticateToken = require("../middleware/authMiddleware");

const BankDetailsRouter = express.Router();

BankDetailsRouter.post(
  "/addBankDetails",
  authenticateToken,
  addBankDetails
);
BankDetailsRouter.get(
  "/getAllPaymentDetails",
  authenticateToken,
  getAllPaymentDetails
);
BankDetailsRouter.delete(
  "/removeBankDetails",
  authenticateToken,
  removeBankDetails
);

const UPIRouter = express.Router();

UPIRouter.post("/addUPI", authenticateToken, addUPIDetails);
UPIRouter.delete("/removeUPI", authenticateToken, removeUPIDetails);

module.exports = { BankDetailsRouter, UPIRouter };
