const express = require("express");
const {
  loginController,
  registerController,
  getUserController,
  updateValueController,
  fortgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  preRegisterController,
  getUserByIdController,
  updateUserStatus,
  disableUser,
  getDashboardRecommendations,
  getCustomerSegments,
  getSalesForecast,
  getFraudDetection,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const { verifyTokenController } = require("../helpers/authHelper");
const {
  setProfileImgController,
  getProfileImgController,
  updateProfileImgController,
  deleteProfileImgController,
} = require("../controllers/profileImgcontroller");

//router object
const router = express.Router();

//routes

//profile image set in profile table
router.post("/setProfile-img", setProfileImgController);

router.get("/getProfile-img/:user_id", getProfileImgController);

router.delete("/deleteProfile-img/:user_id", deleteProfileImgController);

router.patch("/updateProfile-img/:user_id", updateProfileImgController);

//verify the token and send related response
router.post("/verify-token", verifyTokenController);

//Login || POST
router.post("/login", loginController);

// Registration || POST
router.post("/register", registerController);

//forgot password
router.post("/forgot-password", fortgotPasswordController);

// varify the otp which sent to user`s mail id
router.post("/verify/otp", verifyOtpController);

// reset password
router.post("/reset-password", resetPasswordController);

//for get all users || GET
router.get("/users", getUserController);

//get particular  user data
router.get("/users/:user_id", getUserByIdController);

//update data
router.patch("/update-profile", authenticateToken, updateValueController);
router.patch("/updateUserStatus", authenticateToken, updateUserStatus);

//send otp for login and save otp in database
router.post("/pre_register", preRegisterController);

// Personalized dashboard recommendations for a user
router.get(
  "/users/:user_id/dashboard-recommendations",
  getDashboardRecommendations
);

// Customer segmentation endpoint
router.get("/users/customer-segments", getCustomerSegments);

// Sales forecasting endpoint
router.get("/orders/sales-forecast", getSalesForecast);
// Fraud detection endpoint
router.get("/orders/fraud-detection", getFraudDetection);

module.exports = router;
