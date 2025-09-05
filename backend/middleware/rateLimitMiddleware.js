const rateLimit = require("express-rate-limit");

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

// Auth rate limiter (stricter limits for auth endpoints)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message:
      "Too many authentication attempts from this IP, please try again later.",
  },
});

// API rate limiter (more generous for API endpoints)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: "Too many API requests from this IP, please try again later.",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
};
