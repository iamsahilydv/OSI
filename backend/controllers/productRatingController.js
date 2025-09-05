const DbConnection = require("../config/pool");

async function createRating(product_id, average, totalReviews) {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      INSERT INTO ratings (product_id, average, totalReviews)
      VALUES (?, ?, ?)
    `;
    await conn.query(query, [product_id, average, totalReviews]);
    conn.release();
    return { success: true, message: "Rating created successfully." };
  } catch (error) {
    return { success: false, message: error.message || "Error creating rating." };
  }
}

async function getRating(rating_id) {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      SELECT * FROM ratings WHERE id = ?
    `;
    const [rows] = await conn.query(query, [rating_id]);
    conn.release();
    if (rows.length === 0) {
      return { success: false, message: "Rating not found." };
    }
    return { success: true, rating: rows[0] };
  } catch (error) {
    return { success: false, message: error.message || "Error fetching rating." };
  }
}

async function updateRating(rating_id, newValues) {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const { average, totalReviews } = newValues;
    const query = `
      UPDATE ratings
      SET average = ?, totalReviews = ?
      WHERE id = ?
    `;
    await conn.query(query, [average, totalReviews, rating_id]);
    conn.release();
    return { success: true, message: "Rating updated successfully." };
  } catch (error) {
    return { success: false, message: error.message || "Error updating rating." };
  }
}

async function deleteRating(rating_id) {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    const query = `
      DELETE FROM ratings WHERE id = ?
    `;
    await conn.query(query, [rating_id]);
    conn.release();
    return { success: true, message: "Rating deleted successfully." };
  } catch (error) {
    return { success: false, message: error.message || "Error deleting rating." };
  }
}

module.exports = {
  createRating,
  getRating,
  updateRating,
  deleteRating,
};
