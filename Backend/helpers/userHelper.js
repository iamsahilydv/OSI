const bcrypt = require("bcrypt");
const createConnectionDb = require("../config/pool");

//verifying password and hashed password
const verifyPassword = async ({ password, hashedPassword }) => {
  try {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    return passwordMatch;
  } catch (err) {
    console.error("Password verification failed:", err);
    return false;
  }
};

//generate hashed password
const hashedPassword = async (myPlaintextPassword) => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(myPlaintextPassword, salt);
    return hash;
  } catch (err) {
    console.error("Hash generation failed:", err);
    return null; // Handle the error appropriately in your application
  }
};

//token veryfication
const Token_verification = async (token) => {
  try {
    const res = await jwt.verify(token, process.env.SECRET_KEY);
    return res;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error; // Rethrow the error or handle it as needed
  }
};

// Random string generator
function create_random_string(len) {
  const str = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let random_str = "";
  for (let i = 0; i < len; i++) {
    random_str += str.charAt(Math.floor(Math.random() * str.length));
  }
  return random_str;
}


module.exports = {
  verifyPassword,
  hashedPassword,
  Token_verification,
  create_random_string,
};
