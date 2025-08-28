const DbConnetion = require("../config/pool");

const todayIncomeUpdator = async () => {
  try {
    const conn = await DbConnetion();
    const [data] = await conn.query(
      `SELECT * FROM shoping_users WHERE status = ?`,
      ["active"]
    );
    // console.log(data);
    for (let i = 0; i < data.length; i++) {
      let user = data[i];
      // console.log(user);
      let [referData] = await conn.query(
        `SELECT * FROM referPayments WHERE user_id =? AND status=?`,
        [user.id, "pending"]
      );
      console.log(`refer data is ${referData} and i is ${i}`);
      for (let j = 0; j < referData.length; j++) {
        // await conn.query(
        //   `UPDATE shoping_users SET today_income=? WHERE id =?`,
        //   [referData[j].payment, user.id]
        // );
      }
    }
  } catch (error) {
    console.log({ "today Income updator error:": error });
  }
};

module.exports = todayIncomeUpdator;
