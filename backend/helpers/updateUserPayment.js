const DbConnetion = require("../config/pool");

const updateUserPayment = async ({ payload, user_id }) => {
  //update total income of user
  try {
    const conn = await DbConnetion();
    await conn.query(
      `UPDATE shoping_users SET total_income = total_income+? WHERE id =? `,
      [payload, user_id]
    );
  } catch (error) {
    console.log({ "updateUserPayment Error": error });
  }
};

module.exports = updateUserPayment;
