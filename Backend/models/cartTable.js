const DbConnetion = require("../config/pool");

const createCartTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        qty INT NOT NULL DEFAULT 1 CHECK (qty > 0),
        user_id INT,
        variation_id INT,
        business_volume DECIMAL(10, 2) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES shoping_users(id),
        FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Cart table with variation_id ready.");
  } catch (error) {
    console.log({
      CartTableCreationError: error.message || "Cart Table Creation Error!",
    });
  }
};

module.exports = createCartTable;
