const DbConnection = require("../config/pool");

async function createPriceController(req, res) {
  const { product_id, original, discountPercentage, currency } = req.body;
  try {
    const current = original - (original * discountPercentage) / 100;
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      INSERT INTO prices (product_id, current, original, discountPercentage, currency)
      VALUES (?, ?, ?, ?, ?)
    `;
    await conn.query(query, [
      product_id,
      current,
      original,
      discountPercentage,
      currency,
    ]);
    res.json({ success: true, message: "Price created successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function getPriceController(req, res) {
  const product_id = req.params.id;
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      SELECT * FROM prices WHERE product_id = ?
    `;
    const [rows] = await conn.query(query, [product_id]);
    if (rows.length === 0) {
      res.json({ success: false, message: "Price not found." });
    } else {
      res.json({ success: true, price: rows[0] });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function updatePriceController(req, res) {
  const product_id = req.params.id;
  const { original, discountPercentage, currency } = req.body;
  const current = original - (original * discountPercentage) / 100;
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      UPDATE prices
      SET current = ?, original = ?, discountPercentage = ?, currency = ?
      WHERE product_id = ?
    `;
    await conn.query(query, [
      current,
      original,
      discountPercentage,
      currency,
      product_id,
    ]);
    // conn.release();
    res.json({ success: true, message: "Price updated successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating price.",
    });
  }
}

async function deletePriceController(req, res) {
  const product_id = req.params.id;
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      DELETE FROM prices WHERE product_id = ?
    `;
    await conn.query(query, [product_id]);
    // conn.release();
    res.json({ success: true, message: "Price deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting price.",
    });
  }
}

module.exports = {
  createPriceController,
  getPriceController,
  updatePriceController,
  deletePriceController,
};
