const DbConnetion = require("../config/pool");

const createStagesTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });
    conn.query(`CREATE TABLE IF NOT EXISTS stages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        stage INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES shoping_users(id)
            )`);
  } catch (error) {
    console.log({
      StagesTableCreationError: error.message || "Stages Table Creation Error!",
    });
  }
};

module.exports = createStagesTable;
