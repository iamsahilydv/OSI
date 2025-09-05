const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", err);

  // Database errors
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry found.",
    });
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      success: false,
      message: "Referenced record not found.",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired.",
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error."
        : err.message,
  });
};

module.exports = errorMiddleware;
