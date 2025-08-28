const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");

// Database & Models
const createAllTables = require("./models/allTables");
const { updateWallerAmoutHelper } = require("./helpers/referPaymentHelper");
const { disableUser } = require("./controllers/userController");
const setupDefaultCategories = require("./scripts/setupCategories");

// Load environment variables
dotenv.config();
console.log(process.env.ENVIRONMENT); // Log the environment variable for debugging

// Initialize Express App
const app = express();

// Database Initialization
const initializeDB = async () => {
  try {
    await createAllTables();
    await setupDefaultCategories();
    // await updateWallerAmoutHelper();
    // await disableUser();
    console.log("✅ Database initialized successfully.");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};
initializeDB(); // Calling DB-related functions inside app.js

// **Schedule Wallet Update & User Disable Function**
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("🔄 Running scheduled tasks at midnight...");
    await updateWallerAmoutHelper();
    await disableUser();
    console.log("✅ Daily tasks completed.");
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", // Adjust as per your server timezone
  }
);
console.log("✅ Daily job scheduled to run at midnight.");

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
// Serve static files from 'images' folder
app.use("/image", express.static(path.join(__dirname, "image")));

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to OnestepIndia!");
});

// Import Routes
const router = require("./routes/userRoute");
const cartRouter = require("./routes/cartRoute");
const orderRouter = require("./routes/orderRoute");
const categoryRoute = require("./routes/category");
const productRouter = require("./routes/productRoute");
const subscribeRoute = require("./routes/subscribe");
const featureRoute = require("./routes/featuresRoute");
const customerReviewRoute = require("./routes/customerReviewsRoutes");
const priceRoute = require("./routes/priceRoute");
const stageRoute = require("./routes/stageRoute");
const Transactionrouter = require("./routes/transactionroute");
const { BankDetailsRouter, UPIRouter } = require("./routes/bankDetailsRoute");
const { addressRouter } = require("./routes/addressRoute");
const referRoute = require("./routes/referalRoute");
const categoryAttributesRouter = require("./routes/categoryAttributesRoute");

// Use Routes
app.use("/api/v1", router);
app.use("/api/v1", productRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", categoryRoute);
app.use("/api/v1", subscribeRoute);
app.use("/api/v1", featureRoute);
app.use("/api/v1", priceRoute);
app.use("/api/v1", customerReviewRoute);
app.use("/api/v1", stageRoute);
app.use("/api/v1", Transactionrouter);
app.use("/api/v1", BankDetailsRouter);
app.use("/api/v1", UPIRouter);
app.use("/api/v1", addressRouter);
app.use("/api/v1", referRoute);
app.use("/api/v1", categoryAttributesRouter);

module.exports = app;
