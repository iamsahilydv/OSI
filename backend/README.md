# OneStepIndia Backend

## Overview

This is the backend for the OneStepIndia multi-category e-commerce platform. It supports a wide range of product types, user management, order processing, and advanced data mining features for business intelligence.

---

## Features

- Multi-category product management (electronics, clothing, subscriptions, etc.)
- Flexible product variations and category-specific attributes
- User authentication and profile management
- Cart, order, and transaction management
- Product recommendations (single product & personalized dashboard)
- Customer segmentation (K-means clustering)
- Sales forecasting (time series analysis)
- Fraud detection (rule-based & anomaly detection)
- Scheduled jobs for wallet updates and user disabling

---

## Architecture

- **Node.js + Express** REST API
- **MySQL** database (see `/models` for schema)
- Modular structure: controllers, routes, helpers, models
- Environment config via `.env`

---

## Setup & Installation

1. Install dependencies:
   ```bash
   cd Backend
   npm install
   ```
2. Configure your `.env` file with MySQL credentials and other secrets.
3. Start the server:
   ```bash
   npm start
   ```
4. The API will run on `http://localhost:8080` by default.

---

## Key API Endpoints

### Product & Category

- `GET /api/v1/products/:pid/recommendations` — Similar product recommendations
- `GET /api/v1/products` — List all products
- `GET /api/v1/products/:pid` — Get product details
- `POST /api/v1/register-product` — Add a new product

### User & Dashboard

- `GET /api/v1/users/:user_id/dashboard-recommendations` — Personalized recommendations
- `GET /api/v1/users/customer-segments` — Customer segmentation (K-means)

### Orders & Analytics

- `GET /api/v1/orders/sales-forecast` — Sales forecasting (next 7 days)
- `GET /api/v1/orders/fraud-detection` — Fraud/anomaly detection

### Auth & Profile

- `POST /api/v1/login` — User login
- `POST /api/v1/register` — User registration
- ...and more (see `/routes`)

---

## Data Mining Integrations

### Product Recommendations

- **Single Product Page:** Recommends similar products by category/brand.
- **Dashboard:** Personalized suggestions based on user’s purchase and cart history.

### Customer Segmentation

- Uses K-means-like clustering on user purchase and profile data.
- Segments: low, medium, high value (for marketing/analytics).

### Sales Forecasting

- Predicts next 7 days’ sales using a moving average on historical order data.

### Fraud Detection

- Flags suspicious orders (high value/quantity, frequency anomalies).
- Identifies users with abnormal order patterns.

---

## Database Schema

- See `/models` for table definitions (users, products, orders, cart, etc.)
- Flexible product attributes via JSON fields

---

## Contributing & Testing

- Use Postman or similar tools to test API endpoints.
- See `MULTI_CATEGORY_SYSTEM.md` for business logic and migration notes.

---

## Business Idea Rating

**OneStepIndia** is a robust, scalable multi-category e-commerce platform with advanced analytics and data mining. The integration of recommendations, segmentation, forecasting, and fraud detection is highly valuable for modern commerce.

**Rating: 9/10**

- Pros: Flexible, data-driven, extensible, supports many business models.
- Cons: Could further benefit from deeper ML/AI and real-time analytics in the future.

---

## License

ISC

---

## Contact

For support, see the API docs or contact the development team.
