const connectToDatabase = require("../config/pool");
const { updateOrCreateReferPayment } = require("../helpers/referPaymentHelper");
const Node = require("./binary");

// Calling all things from here
const create_binary_tree = async () => {
  try {
    const conn = await connectToDatabase({ timeout: 10000 }); // Increase timeout value
    const result = await conn.query(`SELECT * FROM shoping_users`);
    // console.log(result[0]);

    // Initialize the tree
    const tree = new Node();
    let firstUser = result[0].shift();
    firstUser = [firstUser];
    // console.log(result[0]);
    let restUser = result[0];
    // console.log(restUser);
    tree.insert(firstUser);
    // Insert data into the tree one by one
    for (let i = 0; i < restUser.length; i++) {
      // console.log(i);
      tree.insertUnderReferId(restUser[i]);
    }
    tree.visualizeTree(tree.root);
    // tree.inOrder();
    // console.log(tree.countLeftAndRightNodesById(2));
    let totalUser = firstUser.concat(restUser);
    // console.log(totalUser);
    await updateOrCreateReferPayment(totalUser, tree);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};
// create_binary_tree();

const create_payments = async (parent_id, id) => {
  let user_object = [];
  try {
    const conn = await connectToDatabase({ timeout: 10000 }); // Increase timeout value
    let current_referby = parent_id;
    for (let i = 0; i < 10; i++) {
      const result = await conn.query(
        "SELECT * FROM shoping_users WHERE referId = ?",
        [current_referby]
      );
      if (result?.[0].length < 1) {
        break;
      } else {
        console.log(
          `Current Referby for id ${result[0][0].id} is ${result[0][0].referby}`
        );
        user_object.push(result[0][0].id);
        current_referby = result[0][0].referby;

        if (user_object.length === 10) {
          break;
        }
      }
    }
    console.log("hi here");
    console.log(user_object);
    let response = await updateOrCreateReferPayment({ data: user_object });
    if (response === true) {
      await conn.query(`UPDATE shoping_users SET status = ? WHERE id = ?`, [
        "active",
        id,
      ]);
      let totalrefer = await conn.query(
        `SELECT * FROM shoping_users WHERE referby = ? AND status = ? `,
        [parent_id, "active"]
      );
      console.log("Total Refer is");
      console.log(totalrefer[0]);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = create_binary_tree;
// module.exports = create_payments;
