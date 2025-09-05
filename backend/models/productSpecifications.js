const DbConnection = require("../config/pool");

const createProductSpecificationsTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS specifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
  } catch (error) {
    console.log({ SpecificationsTableCreationError: error.message || "Specifications Table Creation Error!" });
  }
}

module.exports = createProductSpecificationsTable;
