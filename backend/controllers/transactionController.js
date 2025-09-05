const createConnectionDb = require("../config/pool");
const { getUserFn } = require("../helpers/authHelper");
const getProductPrices = require("../helpers/priceHelper");

const addTransaction = async (req, res) => {
  const { id } = req.params;
  let { amount, upi_id, bank_id } = req.body;

  amount = +amount; // ensure it's a number

  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    const [userData] = await conn.query(
      `SELECT * FROM shoping_users WHERE id = ?`,
      [id]
    );

    if (userData.length !== 1) {
      return res.status(400).json({
        success: false,
        message: "User ID is not correct. Please try with another ID.",
      });
    }

    const user = userData[0];

    if (amount > user.wallet) {
      return res.status(400).json({
        success: false,
        message: "Requested amount exceeds wallet balance.",
      });
    }

    // Get today's date in IST
    const todayIST = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const [withdrawals] = await conn.query(
      `SELECT amount, created_at FROM withdrawal WHERE user_id = ?`,
      [id]
    );

    const todaysTotal = withdrawals
      .filter((w) => {
        const txnDate = new Date(w.created_at).toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
        return txnDate === todayIST;
      })
      .reduce((sum, w) => sum + w.amount, 0);

    if (todaysTotal >= 5000 || todaysTotal + amount > 5000) {
      return res.status(400).json({
        success: false,
        message: `Withdrawal limit exceeded. Today's total: ₹${todaysTotal}, trying to add ₹${amount}.`,
      });
    }

    if (upi_id && bank_id) {
      return res.status(400).json({
        success: false,
        message: "Enter only one: UPI ID or Bank ID.",
      });
    }

    if (!upi_id && !bank_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide either a UPI ID or a Bank ID.",
      });
    }

    let withdrawalSuccess = false;
    let message = "";

    if (upi_id) {
      const [upiCheck] = await conn.query(
        `SELECT * FROM userUpiDetails WHERE id = ?`,
        [upi_id]
      );

      if (upiCheck.length !== 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid UPI ID.",
        });
      }

      await conn.query(
        `INSERT INTO withdrawal (user_id, amount, status, upiKey) VALUES (?, ?, ?, ?)`,
        [id, amount, "pending", upi_id]
      );

      message = `Withdrawal request for ₹${amount} submitted via UPI: ${upiCheck[0].upi_id}`;
      withdrawalSuccess = true;
    }

    if (bank_id) {
      const [bankCheck] = await conn.query(
        `SELECT * FROM userBankDetails WHERE id = ?`,
        [bank_id]
      );

      if (bankCheck.length !== 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid Bank ID.",
        });
      }

      await conn.query(
        `INSERT INTO withdrawal (user_id, amount, status, bankKey) VALUES (?, ?, ?, ?)`,
        [id, amount, "pending", bank_id]
      );

      message = `Withdrawal request for ₹${amount} submitted via bank: ${bankCheck[0].account_number}`;
      withdrawalSuccess = true;
    }

    if (withdrawalSuccess) {
      const newWithdrawTotal = user.total_withdraw + amount;
      await conn.query(
        `UPDATE shoping_users SET total_withdraw = ? WHERE id = ?`,
        [newWithdrawTotal, id]
      );

      return res.status(200).json({
        success: true,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while processing the request.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { status, transactionID, withdrawalID } = req.body;
  // console.log(status);
  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    const userPresent = await conn.query(
      `
    SELECT * FROM shoping_users WHERE id = ?
    `,
      [id]
    );
    if (userPresent[0].length === 1) {
      const updateTransaction = await conn.query(
        `
            UPDATE withdrawal SET status = ? AND transactionID = ? WHERE id = ?
          `,
        [status, transactionID, withdrawalID]
      );
      res.status(200).json({
        success: true,
        message: "Payment Approved!!!",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Check User ID",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const allSuccessTransaction = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const transactions = await conn.query(
      `
    SELECT * FROM withdrawal WHERE status = ?
    `,
      [true]
    );
    const transactionwithDetails = await Promise.all(
      transactions[0].map(async (el) => {
        if (el.upiKey !== null) {
          let upiDetail = await conn.query(
            `
        SELECT * FROM userUpiDetails WHERE id = ?
        `,
            [el.upiKey]
          );
          el.paymentDetails = upiDetail[0][0];
          return el;
        } else if (el.bankKey !== null) {
          let bankDetail = await conn.query(
            `
        SELECT * FROM userBankDetails WHERE id = ?
        `,
            [el.bankKey]
          );
          el.paymentDetails = bankDetail[0][0];
          return el;
        }
      })
    );
    // console.log(transactionwithDetails);
    return res.status(200).json({
      success: true,
      message: transactionwithDetails,
    });
  } catch (error) {
    console.log(error);
  }
};
const allPendingTransaction = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const transactions = await conn.query(
      `
      SELECT * FROM withdrawal WHERE status = ?
      `,
      [false]
    );
    const transactionwithDetails = await Promise.all(
      transactions[0].map(async (el) => {
        if (el.upiKey !== null) {
          let upiDetail = await conn.query(
            `
        SELECT * FROM userUpiDetails WHERE id = ?
        `,
            [el.upiKey]
          );
          el.paymentDetails = upiDetail[0][0];
          return el;
        } else if (el.bankKey !== null) {
          let bankDetail = await conn.query(
            `
        SELECT * FROM userBankDetails WHERE id = ?
        `,
            [el.bankKey]
          );
          el.paymentDetails = bankDetail[0][0];
          return el;
        }
      })
    );
    // console.log(transactionwithDetails);
    return res.status(200).json({
      success: true,
      message: transactionwithDetails,
    });
  } catch (error) {
    console.log(error);
  }
};
const getPendingTransactionByUser = async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const transactions = await conn.query(
      `
        SELECT * FROM withdrawal WHERE status = ? AND user_id =?
        `,
      [false, id]
    );
    const transactionwithDetails = await Promise.all(
      transactions[0].map(async (el) => {
        if (el.upiKey !== null) {
          let upiDetail = await conn.query(
            `
        SELECT * FROM userUpiDetails WHERE id = ?
        `,
            [el.upiKey]
          );
          el.paymentDetails = upiDetail[0][0];
          return el;
        } else if (el.bankKey !== null) {
          let bankDetail = await conn.query(
            `
        SELECT * FROM userBankDetails WHERE id = ?
        `,
            [el.bankKey]
          );
          el.paymentDetails = bankDetail[0][0];
          return el;
        }
      })
    );
    // console.log(transactionwithDetails);
    return res.status(200).json({
      success: true,
      message: transactionwithDetails,
    });
  } catch (error) {
    console.log(error);
  }
};
const getSuccessTransactionByUser = async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const transactions = await conn.query(
      `
          SELECT * FROM withdrawal WHERE status = ? AND user_id = ?
          `,
      [true, id]
    );
    const transactionwithDetails = await Promise.all(
      transactions[0].map(async (el) => {
        if (el.upiKey !== null) {
          let upiDetail = await conn.query(
            `
        SELECT * FROM userUpiDetails WHERE id = ?
        `,
            [el.upiKey]
          );
          el.paymentDetails = upiDetail[0][0];
          return el;
        } else if (el.bankKey !== null) {
          let bankDetail = await conn.query(
            `
        SELECT * FROM userBankDetails WHERE id = ?
        `,
            [el.bankKey]
          );
          el.paymentDetails = bankDetail[0][0];
          return el;
        }
      })
    );
    // console.log(transactionwithDetails);
    return res.status(200).json({
      success: true,
      message: transactionwithDetails,
    });
  } catch (error) {
    console.log(error);
  }
};

const getTurnover = async (req, res) => {
  const { id } = req.params;
  let token = req.headers.authorization.split(" ");
  token = token[1];
  console.log(token);
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    let result = await conn.query(`SELECT * FROM shoping_users WHERE id = ?`, [
      id,
    ]);
    result = result[0][0];
    // console.log("id is ", id);
    // console.log("resultId is ", result.id);

    let user = await getUserFn(token);
    user = user.user[0];
    // console.log("userId is ", user.id);
    if (result.id == user.id && user.id == id) {
      // console.log(user);
      // console.log("valid user");

      if (user.role == "superAdmin") {
        const turnoverResult = await conn.query(
          `select paidAmount from orders where delivered = 1 and pymentStatus = 1 and delivered_at IS NOT NULL`
        );
        console.log(turnoverResult[0]);
        let turnOver = 0;
        turnoverResult[0].filter((el) => {
          console.log(el.paidAmount);
          turnOver += el.paidAmount;
        });
        console.log(turnOver);
        const obj = {
          requestedBy: user.id,
          totalTurnOver: turnOver,
        };
        return res.status(200).json({ success: true, message: obj });
      } else {
        // console.log("here");
        return res.status(400).json({
          success: false,
          message: "User is not authorized to see this Information",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "User id and token response not match",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error: error });
  }
};

const getTodaysTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const [todaysEarning] = await conn.query(
      `
        SELECT * 
        FROM referPayments 
        WHERE DATE(created_at) = DATE(CONVERT_TZ(NOW(), '+00:00', '+05:30'))
        AND user_id = ?;
      `,
      [id]
    );

    console.log(todaysEarning);
    return res.status(200).json({
      success: true,
      message: todaysEarning,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllTransactionController = async (req, res) => {
  let token = req.headers.authorization;
  token = token.split(" ")[1];
  let user = await getUserFn(token);
  user = user.user[0];

  if (user.role === "superAdmin" || user.role === "admin") {
    try {
      const conn = await createConnectionDb({ timeout: 10000 });

      const [transactionsEarning] = await conn.query(
        `SELECT * FROM referPayments`
      );
      const [transactionsWithdrawal] = await conn.query(
        `SELECT * FROM withdrawal`
      );

      return res.status(200).json({
        success: true,
        message: {
          earnings: transactionsEarning,
          withdrawals: transactionsWithdrawal,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching transactions",
      });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "User is not authorized to see this information.",
    });
  }
};

const getTransactionByUserController = async (req, res) => {
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

    const [referPayments] = await conn.query(
      `SELECT * FROM referPayments WHERE user_id = ?`,
      [user.id]
    );

    const [withdrawals] = await conn.query(
      `SELECT * FROM withdrawal WHERE user_id = ?`,
      [user.id]
    );

    return res.status(200).json({
      success: true,
      message: {
        earnings: referPayments,
        withdrawals: withdrawals,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching transactions",
    });
  }
};

const createWithdrawalController = async (req, res) => {
  let { amount, upi_id, bank_id } = req.body;

  try {
    // ✅ Extract user from token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided." });
    }

    let user = await getUserFn(token);
    user = user.user[0];

    amount = +amount;
    if (amount > user.wallet) {
      return res.status(400).json({
        success: false,
        message: "Requested amount exceeds wallet balance.",
      });
    }

    if ((upi_id && bank_id) || (!upi_id && !bank_id)) {
      return res.status(400).json({
        success: false,
        message: "Provide either UPI ID or Bank ID, not both or none.",
      });
    }

    const conn = await createConnectionDb({ timeout: 10000 });

    // ✅ Daily ₹5000 limit check in IST
    const todayIST = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const [withdrawals] = await conn.query(
      `SELECT amount, created_at FROM withdrawal WHERE user_id = ?`,
      [user.id]
    );

    const todaysTotal = withdrawals
      .filter(
        (w) =>
          new Date(w.created_at).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
          }) === todayIST
      )
      .reduce((sum, w) => sum + w.amount, 0);

    if (todaysTotal + amount > 5000) {
      return res.status(400).json({
        success: false,
        message: `Daily limit exceeded. Today's total: ₹${todaysTotal}, trying to add ₹${amount}.`,
      });
    }

    let withdrawalSuccess = false;
    let methodMessage = "";

    // ✅ Handle UPI Withdrawal
    if (upi_id) {
      const [upiCheck] = await conn.query(
        `SELECT * FROM userUpiDetails WHERE id = ? AND user_id = ?`,
        [upi_id, user.id]
      );
      if (upiCheck.length !== 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid UPI ID.",
        });
      }

      const [WithdrawalRequest] = await conn.query(
        `INSERT INTO withdrawal (user_id, amount, status, upiKey, bankKey) VALUES (?, ?, ?, ?, ?)`,
        [user.id, amount, "pending", upi_id, null]
      );

      if (WithdrawalRequest.affectedRows === 1) {
        withdrawalSuccess = true;
        methodMessage = `via UPI: ${upiCheck[0].upi_id}`;
      }
    }

    // ✅ Handle Bank Withdrawal
    if (bank_id) {
      const [bankCheck] = await conn.query(
        `SELECT * FROM userBankDetails WHERE id = ? AND user_id = ?`,
        [bank_id, user.id]
      );
      if (bankCheck.length !== 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid Bank ID.",
        });
      }

      const [WithdrawalRequest] = await conn.query(
        `INSERT INTO withdrawal (user_id, amount, status, upiKey, bankKey) VALUES (?, ?, ?, ?, ?)`,
        [user.id, amount, "pending", null, bank_id]
      );

      if (WithdrawalRequest.affectedRows === 1) {
        withdrawalSuccess = true;
        methodMessage = `via bank: ${bankCheck[0].account_number}`;
      }
    }

    if (withdrawalSuccess) {
      await conn.query(
        `UPDATE shoping_users SET total_withdraw = total_withdraw + ? WHERE id = ?`,
        [amount, user.id]
      );

      return res.status(200).json({
        success: true,
        message: `Withdrawal request for ₹${amount} submitted ${methodMessage}.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to process withdrawal request.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllWithdrawalController = async (req, res) => {
  let token = req.headers.authorization;
  console.log(token);
  token = token.split(" ");
  token = token[1];
  let user = await getUserFn(token);
  user = user.user[0];
  console.log(user);
  if (user.role === "superAdmin" || user.role === "admin") {
    try {
      const conn = await createConnectionDb({ timeout: 10000 });
      const transactions = await conn.query(
        `
          SELECT * FROM withdrawal
        `
      );
      return res.status(200).json({
        success: true,
        message: transactions[0],
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "User is not authorized to see this Information",
    });
  }
};
const getUserWithdrawalController = async (req, res) => {
  let token = req.headers.authorization;
  console.log(token);
  token = token.split(" ");
  token = token[1];
  let user = await getUserFn(token);
  user = user.user[0];
  console.log(user);
  if (user) {
    try {
      const conn = await createConnectionDb({ timeout: 10000 });
      const transactions = await conn.query(
        `
          SELECT * FROM withdrawal WHERE user_id = ?
        `,
        [user.id]
      );
      return res.status(200).json({
        success: true,
        message: transactions[0],
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Token Invalid or User not found",
    });
  }
};
module.exports = {
  addTransaction,
  updateTransaction,
  allSuccessTransaction,
  allPendingTransaction,
  getPendingTransactionByUser,
  getSuccessTransactionByUser,
  getTurnover,
  getTodaysTransaction,
  getAllTransactionController,
  getTransactionByUserController,
  createWithdrawalController,
  getAllWithdrawalController,
  getUserWithdrawalController,
};
