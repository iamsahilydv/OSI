const cors = require("cors");

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://yourdomain.com",
      "https://www.yourdomain.com",
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
