const DbConnection = require("../config/pool");
const StageProgressCalculator = require("../helpers/StageProgressCalculator");

const stageControler = async (req, res) => {
  try {
    const conn = await DbConnection(); // Fixed the function call
    const { user_id } = req.params;
    const [user] = await conn.query(`SELECT * FROM shoping_users WHERE id =?`, [
      user_id,
    ]);
    if (!user || user.length == 0) {
      return res
        .status(400)
        .json({ success: false, message: "User Not Found!" });
    }
    const [downlines] = await conn.query(
      `SELECT * FROM shoping_users WHERE referby = ?`,
      [user[0].referId]
    );
    let stage = await StageProgressCalculator(downlines.length);
    return res.status(200).json({ success: true, stage });
  } catch (error) {
    return res
      .status(500)
      .json({ stageRouteError: error || "Stage route throw error!" });
  }
};
module.exports = {
  stageControler,
};
