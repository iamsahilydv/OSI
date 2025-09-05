const nodemailer = require("nodemailer");
const createConnectioDb = require("../config/pool");
const jwt = require("jsonwebtoken");
const StageProgressCalculator = require("./StageProgressCalculator");

async function sendEmail({ otp, email, subject }) {
  // Create a transporter using the SMTP server details
  const transporter = nodemailer.createTransport({
    service: process.env.SERVICE_NAME,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Send the email
    console.log("sending mail");
    const info = await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: subject,
      text: `Your shopingboom reset password OTP  is ${otp}, Please do not share it with anyone.`,
    });
    console.log(info);
    console.log("mail sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

//verify token and send a user details in response

const verifyTokenController = async (req, res) => {
  try {
    const conn = await createConnectioDb({ timeout: 10000 });
    const { token } = req.body;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide a Token!" });
    }

    const userData = await getUserFn(token);
    // console.log(userData);
    const profileImageURL = userData.profileImg[0]?.profile_image;
    userData.user[0].profile_image = profileImageURL;
    if (userData.user.length == 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Token!" });
    }
    const [downlines] = await conn.query(
      `SELECT * FROM shoping_users WHERE referby = ? and subscription =?`,
      [userData.user[0].referId, true]
    );
    let stage = await StageProgressCalculator(downlines.length);
    return res.status(200).json({
      success: true,
      Data: userData.user,
      cartCount: userData.cart.length,
      stage,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserFn = async (token) => {
  const conn = await createConnectioDb({ timeout: 10000 });
  const decode = await jwt.verify(token, process.env.SECRET_KEY);
  const [user] = await conn.query(
    `SELECT * FROM shoping_users WHERE id =? LIMIT 1 `,
    decode.id
  );

  const [cart] = await conn.query(
    `SELECT * FROM cart WHERE user_id=?`,
    decode.id
  );
  let [profileImg] = await conn.query(
    `SELECT profile_image FROM userProfileImg WHERE user_id = ? LIMIT 1`,
    decode.id
  );
  return { user, cart, profileImg };
};

async function createPasswordResetTokensTable() {
  try {
    // Connect to the SQL Server
    const conn = await createConnectioDb({ timeout: 10000 });

    // Execute the SQL query to create the table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS PasswordResetOtps (
        user_id INT  NOT NULL,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(255) NOT NULL,
        expirationDate DATETIME NOT NULL
      );
    `);

    console.log("PasswordResetOtps table created successfully");
  } catch (error) {
    console.error("Error creating PasswordResetOtps table:", error);
  }
}

function generateOTP(num) {
  var otp = "";
  for (var i = 0; i < num; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

module.exports = {
  createPasswordResetTokensTable,
  generateOTP,
  sendEmail,
  verifyTokenController,
  getUserFn,
};
