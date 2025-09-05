const DbConnection = require("../config/pool");

const createProductFeaturesTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS productFeatures (
        id INT PRIMARY KEY AUTO_INCREMENT,
        feature VARCHAR(255) NOT NULL,
        product_id INT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
  } catch (error) {
    console.log({
      ProductFeaturesTableCreationError:
        error.message || "Product Features Table Creation Error!",
    });
  }
};

module.exports = createProductFeaturesTable;
