const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const secretKey = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "UnAuthrized",
    });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Forbidden",err });
    }
    req.user = user; // Set the user object in the request for future access
    next(); // Move to the next middleware or route handler
  });
}

module.exports = authenticateToken;
