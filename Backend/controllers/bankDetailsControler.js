const createConnectionDb = require("../config/pool");
const { getUserFn } = require("../helpers/authHelper");

const addBankDetails = async (req, res) => {
  let {
    account_holder_name,
    account_number,
    bank_name,
    branch_name,
    ifsc_code,
  } = req.body;

  let token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  try {
    token = token.split(" ")[1];
    let user = await getUserFn(token);
    user = user.user[0];

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token invalid or user not found",
      });
    }

    const conn = await createConnectionDb({ timeout: 10000 });

    account_holder_name = account_holder_name.toUpperCase();
    account_number = account_number.toUpperCase();
    bank_name = bank_name.toUpperCase();
    branch_name = branch_name.toUpperCase();
    ifsc_code = ifsc_code.toUpperCase();

    const [existing] = await conn.query(
      `SELECT * FROM userBankDetails WHERE user_id = ? AND account_number = ? AND bank_name = ?`,
      [user.id, account_number, bank_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This bank detail is already present",
      });
    }

    await conn.query(
      `
      INSERT INTO userBankDetails
      (account_holder_name, account_number, bank_name, branch_name, ifsc_code, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        account_holder_name,
        account_number,
        bank_name,
        branch_name,
        ifsc_code,
        user.id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Bank details added successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPaymentDetails = async (req, res) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  try {
    token = token.split(" ")[1];
    let user = await getUserFn(token);
    user = user.user[0];

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token or user not found",
      });
    }

    const conn = await createConnectionDb({ timeout: 10000 });
    const [paymentData] = await conn.query(
      `SELECT * FROM userBankDetails WHERE user_id = ?`,
      [user.id]
    );
    const [upiData] = await conn.query(
      `SELECT * FROM userUpiDetails WHERE user_id = ?`,
      [user.id]
    );

    return res.status(200).json({
      success: true,
      message: { upiData: upiData, bankData: paymentData },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const removeBankDetails = async (req, res) => {
  let token = req.headers.authorization;
  const { bank_id } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  try {
    token = token.split(" ")[1];
    let user = await getUserFn(token);
    user = user.user[0];

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token or user not found",
      });
    }

    const conn = await createConnectionDb({ timeout: 10000 });

    const [existing] = await conn.query(
      `SELECT * FROM userBankDetails WHERE user_id = ? AND id = ?`,
      [user.id, bank_id]
    );

    if (existing.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Bank details not found for the given user and bank ID",
      });
    }

    await conn.query(
      `DELETE FROM userBankDetails WHERE user_id = ? AND id = ?`,
      [user.id, bank_id]
    );

    return res.status(200).json({
      success: true,
      message: "Bank details removed successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addUPIDetails = async (req, res) => {
  let token = req.headers.authorization;
  let { upi_id, upi_provider, is_default } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  token = token.split(" ")[1];
  let user = await getUserFn(token);
  user = user.user[0];

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid token or user not found",
    });
  }

  upi_id = upi_id.toUpperCase();
  upi_provider = upi_provider.toUpperCase();

  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    const [existingUPI] = await conn.query(
      `SELECT * FROM userUpiDetails WHERE upi_id = ?`,
      [upi_id]
    );

    if (existingUPI.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This UPI ID is already in use.",
      });
    }

    const [existingUserUpis] = await conn.query(
      `SELECT id FROM userUpiDetails WHERE user_id = ?`,
      [user.id]
    );

    // If this is the user's first UPI, make it default
    if (existingUserUpis.length === 0) {
      is_default = true;
    } else if (is_default) {
      // If a new UPI is set as default, reset previous defaults
      await conn.query(
        `UPDATE userUpiDetails SET is_default = false WHERE user_id = ?`,
        [user.id]
      );
    }

    await conn.query(
      `INSERT INTO userUpiDetails (user_id, upi_id, upi_provider, is_default) VALUES (?, ?, ?, ?)`,
      [user.id, upi_id, upi_provider, is_default]
    );

    return res.status(200).json({
      success: true,
      message: "UPI details added successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

const removeUPIDetails = async (req, res) => {
  let token = req.headers.authorization;
  const { upi_id } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  token = token.split(" ")[1];
  let user = await getUserFn(token);
  user = user.user[0];

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid token or user not found",
    });
  }

  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    const [existingUPI] = await conn.query(
      `SELECT * FROM userUpiDetails WHERE user_id = ? AND id = ?`,
      [user.id, upi_id]
    );

    if (existingUPI.length === 0) {
      return res.status(400).json({
        success: false,
        message: "UPI details not found for the given user and UPI ID",
      });
    }

    await conn.query(
      `DELETE FROM userUpiDetails WHERE user_id = ? AND id = ?`,
      [user.id, upi_id]
    );

    return res.status(200).json({
      success: true,
      message: "UPI details removed successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addBankDetails,
  getAllPaymentDetails,
  removeBankDetails,
  addUPIDetails,
  removeUPIDetails,
};
