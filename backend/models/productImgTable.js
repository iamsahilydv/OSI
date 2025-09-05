// models/createProductImageTable.js
const DbConnection = require("../config/pool");

const createProductImageTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variation_id INT NOT NULL,
        image_url VARCHAR(800) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE
      );
    `);

    console.log("✅ product_images table created successfully");
  } catch (error) {
    console.error({
      ProductImageTableError:
        error.message || "Failed to create product_images table",
    });
  }
};

module.exports = createProductImageTable;
