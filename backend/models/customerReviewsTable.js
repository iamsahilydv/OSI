const DbConnection = require("../config/pool");

const createCustomerReviewsTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS customerReviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        rating DECIMAL(3, 2) NOT NULL,
        review_text TEXT NOT NULL,
        review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
  } catch (error) {
    console.log({ CustomerReviewsTableCreationError: error.message || "Customer Reviews Table Creation Error!" });
  }
}

module.exports = createCustomerReviewsTable;
