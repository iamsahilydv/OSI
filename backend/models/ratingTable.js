const DbConnetion = require("../config/pool");

const createRatingTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        average DECIMAL(5, 2) NOT NULL,
        totalReviews INT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
  } catch (error) {
    console.log({ RatingTableCreationError: error.message || "Rating Table Creation Error!" });
  }
}

module.exports = createRatingTable;
