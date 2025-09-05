const DbConnetion = require("../config/pool");

const setOrUpdateReferPaymentController = async (
  // id,
  // status,
  // distributionAmount
  { user_id, userName, referPairCount, status }
) => {
  try {
    const conn = await DbConnetion();
    // console.log(`refer pair count`, referPairCount);
    const [referPaymentCount] = await conn.query(
      `SELECT * FROM referPayments WHERE user_id =?`,
      [user_id]
    );
    console.log(`refer pair count: ${referPairCount}`);
    console.log(`referPaymentCount`, referPaymentCount.length);
    for (let i = 0; i < referPairCount - referPaymentCount.length; i++) {
      const [data] = await conn.query(
        `SELECT * FROM shoping_users WHERE id =?`,
        [user_id]
      );
      const [transactionResult] = await conn.query(
        `
        SELECT COUNT(*) AS transaction_count 
        FROM referPayments 
        WHERE user_id = ? AND status = "pending"
        AND YEAR(created_at) = YEAR(CURDATE())
        AND MONTH(created_at) = MONTH(CURDATE())
        AND DAY(created_at) = DAY(CURDATE());
        `,
        [user_id]
      );

      const todaysTransaction = transactionResult[0]; // Access the first row of the result
      console.log(todaysTransaction);
      if (todaysTransaction.transaction_count >= 20) {
        status = "exceeded";
      }
      console.log(status);
      console.log("Hereeee");
      // console.log(data);
      if (data.length == 0) {
        return false;
      } else {
        // console.log(data[0]);
        // Set the time to midnight and add 1 day

        const nextMidnightDate = new Date();
        nextMidnightDate.setHours(0, 0, 0, 0);
        nextMidnightDate.setDate(nextMidnightDate.getDate());
        nextMidnightDate.setHours(23, 59, 59, 0);
        console.log("here in payment");
        await conn.query(
          `INSERT INTO referPayments(user_id,userName,status,paymentReason,created_at,payment,receive_at) values(?) `,
          [
            [
              user_id,
              userName,
              status,
              "refer",
              new Date(),
              50,
              nextMidnightDate,
            ],
          ]
        );

        // return true;
      }
      console.log(`i is`, i);
    }
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

module.exports = { setOrUpdateReferPaymentController };
