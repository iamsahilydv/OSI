const DbConnetion = require("../config/pool");
const {
  setOrUpdateReferPaymentController,
} = require("../controllers/referPaymentController");
const todayIncomeUpdator = require("./todayIncomeUpdate");
const updateUserPayment = require("./updateUserPayment");

const GST_RATE = 18;
const DIRECT_COMMISSION_PERCENT = 10;
const RESALE_COMMISSION_PERCENT = 1;
const MAX_RESALE_LEVEL = 9;

const getNextMidnight = () => {
  const nextMidnight = new Date();
  nextMidnight.setHours(23, 59, 59, 0);
  return nextMidnight;
};

const insertReferPayment = async (
  conn,
  userId,
  userName,
  status,
  reason,
  amount
) => {
  const [result] = await conn.query(
    `INSERT INTO referPayments(user_id, userName, status, paymentReason, created_at, payment, receive_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, userName, status, reason, new Date(), amount, getNextMidnight()]
  );
  return result.affectedRows > 0;
};

const updateOrCreateReferPayment = async (users, tree) => {
  const conn = await DbConnetion();
  for (const user of users) {
    try {
      const status = user.status === "inactive" ? "failed" : "pending";

      const { leftCount, rightCount } =
        await tree.countLeftRightActiveNodesById(user.id);

      await conn.query(
        `UPDATE shoping_users SET leftCount = ?, rightCount = ? WHERE id = ?`,
        [leftCount, rightCount, user.id]
      );

      const pairCount = Math.min(leftCount, rightCount);

      const [[{ totalRefer }]] = await conn.query(
        `SELECT COUNT(*) as totalRefer FROM shoping_users WHERE referby = ? AND status = ?`,
        [user.referId, "active"]
      );

      if (pairCount > 0 && totalRefer > 1) {
        await setOrUpdateReferPaymentController({
          user_id: user.id,
          userName: user.name,
          referPairCount: pairCount,
          status,
        });
      }
    } catch (error) {
      console.error(`Error processing user ${user.id}:`, error.message);
    }
  }
};

const createSingleOrderComissionOfParent = async (
  parentId,
  parentStatus,
  price
) => {
  const conn = await DbConnetion();
  const gst = (GST_RATE / 100) * price;
  const netPrice = price - gst;
  const amount = (DIRECT_COMMISSION_PERCENT / 100) * netPrice;

  const [[user]] = await conn.query(
    `SELECT * FROM shoping_users WHERE referId = ?`,
    [parentId]
  );
  const status = parentStatus === "active" ? "pending" : "failed";

  return await insertReferPayment(
    conn,
    user.id,
    user.name,
    status,
    "commission",
    amount
  );
};

const resaleValueComission = async (parentId, parentStatus, price) => {
  const conn = await DbConnetion();
  const gst = (GST_RATE / 100) * price;
  const netPrice = price - gst;
  let currentParentId = parentId;
  const status = parentStatus === "active" ? "pending" : "failed";

  for (let level = 0; level < MAX_RESALE_LEVEL; level++) {
    const [[user]] = await conn.query(
      `SELECT * FROM shoping_users WHERE referId = ?`,
      [currentParentId]
    );
    if (!user) break;

    const amount = (RESALE_COMMISSION_PERCENT / 100) * netPrice;
    await insertReferPayment(
      conn,
      user.id,
      user.name,
      status,
      "ResaleCommission",
      amount
    );

    currentParentId = user.referby;
  }
};

const updateWallerAmoutHelper = async () => {
  const conn = await DbConnetion();
  const [pendingPayments] = await conn.query(
    `SELECT * FROM referPayments WHERE status = "pending"`
  );

  for (const payment of pendingPayments) {
    if (payment.receive_at <= new Date()) {
      await updateUserPayment({
        payload: payment.payment,
        user_id: payment.user_id,
      });
      await conn.query(`UPDATE referPayments SET status = ? WHERE id = ?`, [
        "done",
        payment.id,
      ]);
    }
  }
};

module.exports = {
  updateOrCreateReferPayment,
  updateWallerAmoutHelper,
  createSingleOrderComissionOfParent,
  resaleValueComission,
};
