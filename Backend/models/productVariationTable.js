// models/createProductVariationTable.js
const DbConnection = require("../config/pool");

const createProductVariationTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_variations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        sku VARCHAR(50) NOT NULL UNIQUE,
        variation_name VARCHAR(100) NOT NULL,
        attributes JSON NOT NULL,
        selling_price DECIMAL(10,2),
        stock_quantity INT DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    console.log("✅ product_variations table created successfully");
  } catch (error) {
    console.error({
      VariationTableError:
        error.message || "Failed to create product_variations table",
    });
  }
};

module.exports = createProductVariationTable;
