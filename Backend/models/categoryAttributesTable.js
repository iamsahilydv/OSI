const DbConnection = require("../config/pool");

const createCategoryAttributesTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS category_attributes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT NOT NULL,
        attribute_name VARCHAR(100) NOT NULL,
        attribute_type ENUM('text', 'number', 'select', 'boolean', 'color', 'size') NOT NULL,
        is_required BOOLEAN DEFAULT FALSE,
        options JSON,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE KEY unique_category_attribute (category_id, attribute_name)
      );
    `);

    console.log("✅ category_attributes table created successfully");
  } catch (error) {
    console.error({
      CategoryAttributesTableError:
        error.message || "Failed to create category_attributes table",
    });
  }
};

module.exports = createCategoryAttributesTable;
