const DbConnetion = require("../config/pool");

const createAddressTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });

    // Creating UserAddresses table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS UserAddresses (
      id INT PRIMARY KEY AUTO_INCREMENT,
      userId INT NOT NULL,
      AddressLine1 VARCHAR(255) NOT NULL,
      AddressLine2 VARCHAR(255),
      City VARCHAR(100) NOT NULL,
      State VARCHAR(100) NOT NULL,
      PostalCode VARCHAR(20) NOT NULL,
      Country VARCHAR(100) NOT NULL,
      IsDefault BOOLEAN DEFAULT FALSE,
      isEnabled BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (userId) REFERENCES shoping_users(id)
);

    `);

    // Creating the trigger
    await conn.query(`
      CREATE TRIGGER UpdateDefaultAddress AFTER UPDATE ON UserAddresses
      FOR EACH ROW
      BEGIN
          IF NEW.IsDefault = TRUE THEN
              UPDATE UserAddresses
              SET IsDefault = FALSE
              WHERE userId = NEW.userId AND AddressID != NEW.AddressID;
          END IF;
      END;
    `);
  } catch (error) {
    console.log({
      CartTableCreationError:
        error.message || "UserAddresses Table Creation Error!",
    });
  }
};

module.exports = createAddressTable;
