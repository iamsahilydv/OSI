// models/createQikinkPodDetailsTable.js
const DbConnection = require("../config/pool");

const createQikinkPodDetailsTable = async () => {
  console.log("qikink product table");
  try {
    const conn = await DbConnection({ timeout: 10000 });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS qikink_pod_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        variation_id INT NOT NULL,
        qikink_sku VARCHAR(50) NOT NULL,
        qikink_price DECIMAL(10,2),
        selling_price DECIMAL(10,2),
        print_type_id INT,
        design_code VARCHAR(50),
        design_link TEXT,
        mockup_link TEXT,
        placement_sku VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE
      );
    `);

    console.log("✅ qikink_pod_details table created successfully");
  } catch (error) {
    console.error({
      QikinkDetailsTableError:
        error.message || "Failed to create qikink_pod_details table",
    });
  }
};

module.exports = createQikinkPodDetailsTable;
