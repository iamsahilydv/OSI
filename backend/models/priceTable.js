const DbConnetion = require("../config/pool");

const createPriceTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });

    // Create the new price table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS prices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      variation_id INT NOT NULL,
      original DECIMAL(10,2) NOT NULL,
      discount_percentage DECIMAL(5,2) DEFAULT 0,
      currency VARCHAR(10) DEFAULT 'INR',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE
      );
    `);
  } catch (error) {
    console.log({
      CreateTableError: error.message || "Price Table Creation Error!",
    });
  }
};

module.exports = createPriceTable;
