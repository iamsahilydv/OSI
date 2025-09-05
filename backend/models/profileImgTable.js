const DbConnection = require("../config/pool");

const createProfileImgTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS userProfileImg (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(50) NOT NULL,
        profile_image VARCHAR(800) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_userProfileImg_user FOREIGN KEY (user_id) REFERENCES shoping_users(id)
      );
    `;

    await conn.query(createTableQuery);
  } catch (error) {
    console.error(
      "ProfileImg Table Creation Error:",
      error.message || "Unknown error occurred."
    );
  }
};

module.exports = createProfileImgTable;
