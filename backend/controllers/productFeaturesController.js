const DbConnection = require("../config/pool");

async function createProductFeature(req,res) {
  try {

    const {product_id,feature} =req.body;
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      INSERT INTO productFeatures (product_id, feature)
      VALUES (?, ?)
    `;
    await conn.query(query, [product_id, feature]);
    conn.release();
    return res.status(200).json({ success: true, message: "Product feature created successfully." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating product feature.",
    });
  }
}

async function getProductFeatureById(req, res) {
  try {
    const { id } = req.params;
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      SELECT * FROM productFeatures WHERE id = ?
    `;
    const [rows] = await conn.query(query, [id]);
    if (rows.length === 0) {
      return { success: false, message: "Product feature not found." };
    }
   return res.status(200).json( { success: true, feature: rows[0] });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching product feature.",
    });
  }
}

async function updateProductFeature(req, res) {
  try {
    const { newFeature, feature_id } = req.body;
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      UPDATE productFeatures
      SET feature = ?
      WHERE id = ?
    `;
    await conn.query(query, [newFeature, feature_id]);
    conn.release();
    return res.status(200).json({ success: true, message: "Product feature updated successfully." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating product feature.",
    });
  }
}

async function deleteProductFeature(req, res) {
  try {
    const { id } = req.params;
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      DELETE FROM productFeatures WHERE id = ?
    `;
    await conn.query(query, [id]);
    conn.release();
    return res.status(200).json({ success: true, message: "Product feature deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting product feature.",
    });
  }
}
async function getAllProductFeatures(req, res) {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      SELECT * FROM productFeatures
    `;
    const [rows] = await conn.query(query);
    req.status(200).return({ success: true, features: rows });
  } catch (error) {
   res.status(500).return ({
      success: false,
      message: error.message || "Error fetching product features.",
    });
  }
}

module.exports = {
  createProductFeature,
  getProductFeatureById,
  updateProductFeature,
  deleteProductFeature,
  getAllProductFeatures,
};
