const DbConnection = require("../config/pool");

async function createCustomerReviewController(req, res) {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const { product_id, customer_name, rating, review_text } = req.body;
    const query = `
      INSERT INTO customerReviews (product_id, customer_name, rating, review_text)
      VALUES (?, ?, ?, ?)
    `;
    await conn.query(query, [product_id, customer_name, rating, review_text]);
    conn.release();
    return res
      .status(201)
      .json({
        success: true,
        message: "Customer review created successfully.",
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Error creating customer review.",
      });
  }
}

async function getCustomerReviewController(req, res) {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const review_id = req.params.id;
    const query = `
      SELECT * FROM customerReviews WHERE id = ?
    `;
    const [rows] = await conn.query(query, [review_id]);
    conn.release();
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Customer review not found." });
    }
    return res.status(200).json({ success: true, review: rows[0] });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Error fetching customer review.",
      });
  }
}

async function updateCustomerReviewController(req, res) {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const review_id = req.params.id;
    const { customer_name, rating, review_text } = req.body;
    const query = `
      UPDATE customerReviews
      SET customer_name = ?, rating = ?, review_text = ?
      WHERE id = ?
    `;
    await conn.query(query, [customer_name, rating, review_text, review_id]);
    conn.release();
    return res
      .status(200)
      .json({
        success: true,
        message: "Customer review updated successfully.",
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Error updating customer review.",
      });
  }
}

async function deleteCustomerReviewController(req, res) {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const review_id = req.params.id;
    const query = `
      DELETE FROM customerReviews WHERE id = ?
    `;
    await conn.query(query, [review_id]);
    conn.release();
    return res
      .status(204)
      .json({
        success: true,
        message: "Customer review deleted successfully.",
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Error deleting customer review.",
      });
  }
}

module.exports = {
  createCustomerReviewController,
  getCustomerReviewController,
  updateCustomerReviewController,
  deleteCustomerReviewController,
};
