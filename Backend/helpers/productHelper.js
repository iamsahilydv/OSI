const DbConnetion = require("../config/pool");

async function getProductFeaturesByProductId({ productId }) {
  const conn = await DbConnetion({ timeout: 10000 });
  const result = await conn.query(
    "SELECT feature FROM productFeatures WHERE product_id = ?",
    [productId]
  );
  return result[0].map((row) => row.feature);
}

async function getCustomerReviewsByProductId({ productId }) {
  const conn = await DbConnetion({ timeout: 10000 });
  const result = await conn.query(
    "SELECT customer_name, rating, review_text FROM customerReviews WHERE product_id = ?",
    [productId]
  );
  return result[0];
}
async function getProductSpecifications({ productId }) {
  const conn = await DbConnetion({ timeout: 10000 });
  const result = await conn.query(
    "SELECT title, description FROM specifications WHERE product_id = ? LIMIT 1",
    [productId]
  );
  return result[0][0];
}

module.exports = {
  getProductFeaturesByProductId,
  getCustomerReviewsByProductId,
  getProductSpecifications,
};
