const DbConnection = require("../config/pool");

const createProductTableModel = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        qty INT DEFAULT 1 NOT NULL,
        description VARCHAR(500) NOT NULL,
        category_id INT NOT NULL,
        brand VARCHAR(50) NOT NULL,
        sellby VARCHAR(255) NOT NULL,
        availability BOOLEAN DEFAULT true NOT NULL,
        is_pod BOOLEAN DEFAULT false,  -- New field to identify POD products
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);
  } catch (error) {
    console.log({
      ProductTableCreationError:
        error.message || "Product Table Creation Error!",
    });
  }
};

module.exports = createProductTableModel;
