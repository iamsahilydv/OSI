const express = require("express");
const {
  addAddress,
  updateAddress,
  getAddress,
  deleteAddress,
} = require("../controllers/addressController");
const authenticateToken = require("../middleware/authMiddleware");

const addressRouter = express.Router();

// For adding Address
addressRouter.post(`/addAddress/:id`, authenticateToken, addAddress);

// For Updating Address
addressRouter.patch(
  `/updateAddress/:id/:AddID`,
  authenticateToken,
  updateAddress
);

// for getting all addresses of user
addressRouter.get(`/getAddress/:id`, authenticateToken, getAddress);

// for deleting address
addressRouter.delete(
  `/deleteAddress/:id/:AddID`,
  authenticateToken,
  deleteAddress
);

module.exports = { addressRouter };
