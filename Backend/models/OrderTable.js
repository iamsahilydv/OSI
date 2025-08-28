const DbConnetion = require("../config/pool");

const createOrderTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });

    // 1. Create the order_groups table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        paymentMode VARCHAR(255) NOT NULL,
        addressId INT NOT NULL,
        total_amount DECIMAL(10,2) DEFAULT 0,
        pymentStatus BOOLEAN DEFAULT FALSE,
        paidAmount DECIMAL(10,2) DEFAULT 0,
        delivered BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES shoping_users(id),
        FOREIGN KEY (addressId) REFERENCES UserAddresses(id)
      )
    `);

    // 2. Create the orders table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_group_id INT NOT NULL,
        variation_id INT NOT NULL,
        qty INT NOT NULL DEFAULT 1 CHECK (qty > 0),
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        discountPercentag DECIMAL(5,2) NOT NULL DEFAULT 0,
        original_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        qikink_order_id VARCHAR(255) DEFAULT NULL,
        delivered_at TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_group_id) REFERENCES order_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE
      )
    `);

    console.log(
      "✅ order_groups and orders tables created/verified successfully."
    );
  } catch (error) {
    console.error({
      OrderTableCreationError: error.message || "Order Table Creation Error!",
    });
  }
};

module.exports = createOrderTable;
