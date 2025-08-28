const DbConnetion = require("../config/pool");

 const createCategoryTable = async()=>{
    try {
        const conn = await DbConnetion({ timeout: 10000 });
    await conn.query(`CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT
      )`);
        
    } catch (error) {
        console.log({CategoryTableCreationError:error.message || "Category Table Creation Error!"});
    }
 }
 module.exports = createCategoryTable;