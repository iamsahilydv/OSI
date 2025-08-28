const DbConnetion = require("../config/pool");
const { getUserFn } = require("../helpers/authHelper");

const getReferUserController = async (req, res) => {
  let token = req.headers.authorization;
  console.log(token);
  token = token.split(" ");
  token = token[1];
  const user = await getUserFn(token);
//   console.log(user.user[0]);
  //   if (!user_id) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Please provide user_id",
  //     });
  //   }

  try {
    const conn = await DbConnetion();
    const [referedUser] = await conn.query(
      `SELECT * FROM shoping_users WHERE referby = ?`,
      [user.user[0].referId]
    );
    console.log(referedUser);

    return res.status(200).json({
      success: true,
      data: referedUser,
      referUserCount: referedUser.length,
      message: "Referred users fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching referred users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getReferUserController,
};
