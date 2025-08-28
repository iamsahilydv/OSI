const DbConnetion = require("../config/pool");
const StageProgressCalculator = require("./StageProgressCalculator");

const subscriptionPaymentHelper = async () => {
  const conn = await DbConnetion();
  //first find out the how many people take subscription in this month

  // Check if the function has already been executed this month
  const [lastExecution] = await conn.query(
    "SELECT MAX(execution_month) as last_execution FROM subscription_payment_history"
  );

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are zero-based

  if (
    lastExecution.length > 0 &&
    lastExecution[0].last_execution === currentMonth
  ) {
    console.log("Function already executed this month. Exiting...");
    return;
  }

  // const [data] = await conn.query(
  //   `SELECT * FROM user_subscriptions WHERE end_date > ? and status = ?`,
  //   [new Date(), "active"]
  // );

  const [data] = await conn.query(
    `SELECT * FROM shoping_users WHERE status = ?`,
    ["active"]
  );
  console.log(data);
  await conn.query(
    "INSERT INTO subscription_payment_history (execution_month) VALUES (?)",
    [currentMonth]
  );
  //15% is service cost which go to company account
  let total_amount = data.length * 1000;

  //transfer 15% to company account
  const amount = (total_amount * 15) / 100;
  total_amount = total_amount - amount;
  //build code for transfer amount to company account
  //pending

  //1. find out the who is at which stage
  let zeroPositionUsers = [];
  let firstPositionUsers = [];
  let secondPositionUsers = [];
  let thirdPositionUsers = [];
  let forthPositionUsers = [];
  let fiftPositionUsers = [];
  let sixthPositionUsers = [];
  let seventhPositionUsers = [];
  let eighthPositionUsers = [];
  let ninthPositionUsers = [];
  let topPositionUsers = [];
  let [users] = await conn.query(`SELECT * FROM shoping_users`);
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    const [downlines] = await conn.query(
      `SELECT * FROM shoping_users WHERE referby = ? and status =?`,
      [user.referId, "active"]
    );

    let stage = await StageProgressCalculator(downlines.length);
    console.log({ stage });
    if (stage == -1) {
      continue;
    } else if (stage == 0) {
      zeroPositionUsers.push(user);
    } else if (stage == 1) {
      firstPositionUsers.push(user);
    } else if (stage == 2) {
      secondPositionUsers.push(user);
    } else if (stage == 3) {
      thirdPositionUsers.push(user);
    } else if (stage == 4) {
      forthPositionUsers.push(user);
    } else if (stage == 5) {
      fiftPositionUsers.push(user);
    } else if (stage == 6) {
      sixthPositionUsers.push(user);
    } else if (stage == 7) {
      seventhPositionUsers.push(user);
    } else if (stage == 8) {
      eighthPositionUsers.push(user);
    } else if (stage == 9) {
      ninthPositionUsers.push(user);
    } else if (stage == 10 || stage === "top") {
      topPositionUsers.push(user);
    }
  }
  zeroPositionUsers = zeroPositionUsers.concat(
    firstPositionUsers,
    secondPositionUsers,
    thirdPositionUsers,
    forthPositionUsers,
    fiftPositionUsers,
    sixthPositionUsers,
    seventhPositionUsers,
    eighthPositionUsers,
    ninthPositionUsers,
    topPositionUsers
  );
  firstPositionUsers = firstPositionUsers.concat(
    secondPositionUsers,
    thirdPositionUsers,
    forthPositionUsers,
    fiftPositionUsers,
    sixthPositionUsers,
    seventhPositionUsers,
    eighthPositionUsers,
    ninthPositionUsers,
    topPositionUsers
  );
  secondPositionUsers = secondPositionUsers.concat(
    thirdPositionUsers,
    forthPositionUsers,
    fiftPositionUsers,
    sixthPositionUsers,
    seventhPositionUsers,
    eighthPositionUsers,
    ninthPositionUsers,
    topPositionUsers
  );
  thirdPositionUsers = thirdPositionUsers.concat(
    forthPositionUsers,
    fiftPositionUsers,
    sixthPositionUsers,
    seventhPositionUsers,
    eighthPositionUsers,
    ninthPositionUsers,
    topPositionUsers
  );
  forthPositionUsers = forthPositionUsers.concat(
    fiftPositionUsers,
    sixthPositionUsers,
    seventhPositionUsers,
    eighthPositionUsers,
    ninthPositionUsers,
    topPositionUsers
  );
  fiftPositionUsers = fiftPositionUsers.concat(
    sixthPositionUsers,
    seventhPositionUsers,
    eighthPositionUsers,
    ninthPositionUsers,
    topPositionUsers
  );
  sixthPositionUsers = sixthPositionUsers.concat(
    seventhPositionUsers,
    eighthPositionUsers,
    ninthPositionUsers,
    topPositionUsers
  );
  seventhPositionUsers = seventhPositionUsers.concat(
    eighthPositionUsers,
    ninthPositionUsers,
    topPositionUsers
  );
  eighthPositionUsers = eighthPositionUsers.concat(
    ninthPositionUsers,
    topPositionUsers
  );
  ninthPositionUsers = ninthPositionUsers.concat(topPositionUsers);
  console.log({
    zeroPositionUsers,
    firstPositionUsers,
    secondPositionUsers,
    thirdPositionUsers,
    forthPositionUsers,
    fiftPositionUsers,
    sixthPositionUsers,
    seventhPositionUsers,
    eighthPositionUsers,
    ninthPositionUsers,
    topPositionUsers,
  });

  //now we consider remaining amount as 100%
  //distribute 25% among first position user
  let zeroPositionAmount = (total_amount * 25) / 100;
  if (zeroPositionUsers.length > 0) {
    let oneUserAmount = zeroPositionAmount / zeroPositionUsers.length;
    for (let i = 0; i < zeroPositionUsers.length; i++) {
      let curUser = zeroPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ?  WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }
  let firstPositionAmount = (total_amount * 10) / 100;
  if (firstPositionUsers.length > 0) {
    let oneUserAmount = firstPositionAmount / firstPositionUsers.length;
    for (let i = 0; i < firstPositionUsers.length; i++) {
      let curUser = firstPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ?  WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }
  // Distribute 10% among second position users
  let secondPositionAmount = (total_amount * 10) / 100;
  if (secondPositionUsers.length > 0) {
    let oneUserAmount = secondPositionAmount / secondPositionUsers.length;
    for (let i = 0; i < secondPositionUsers.length; i++) {
      let curUser = secondPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ? WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }

  // Distribute 10% among third position users
  let thirdPositionAmount = (total_amount * 10) / 100;
  if (thirdPositionUsers.length > 0) {
    let oneUserAmount = thirdPositionAmount / thirdPositionUsers.length;
    for (let i = 0; i < thirdPositionUsers.length; i++) {
      let curUser = thirdPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ? WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }
  // Distribute 10% among fourth position users
  let fourthPositionAmount = (total_amount * 5) / 100;
  if (forthPositionUsers.length > 0) {
    let oneUserAmount = fourthPositionAmount / forthPositionUsers.length;
    for (let i = 0; i < forthPositionUsers.length; i++) {
      let curUser = forthPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ? WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }

  // Distribute 5% among fifth position users
  let fifthPositionAmount = (total_amount * 5) / 100;
  if (fiftPositionUsers.length > 0) {
    let oneUserAmount = fifthPositionAmount / fiftPositionUsers.length;
    for (let i = 0; i < fiftPositionUsers.length; i++) {
      let curUser = fiftPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ? WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }

  // Distribute 5% among sixth position users
  let sixthPositionAmount = (total_amount * 5) / 100;
  if (sixthPositionUsers.length > 0) {
    let oneUserAmount = sixthPositionAmount / sixthPositionUsers.length;
    for (let i = 0; i < sixthPositionUsers.length; i++) {
      let curUser = sixthPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ? WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }

  // Distribute 10% among seventh position users
  let seventhPositionAmount = (total_amount * 5) / 100;
  if (seventhPositionUsers.length > 0) {
    let oneUserAmount = seventhPositionAmount / seventhPositionUsers.length;
    for (let i = 0; i < seventhPositionUsers.length; i++) {
      let curUser = seventhPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ? WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }

  // Distribute 10% among eighth position users
  let eighthPositionAmount = (total_amount * 5) / 100;
  if (eighthPositionUsers.length > 0) {
    let oneUserAmount = eighthPositionAmount / eighthPositionUsers.length;
    for (let i = 0; i < eighthPositionUsers.length; i++) {
      let curUser = eighthPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ? WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }

  // Distribute 10% among ninth position users
  let ninthPositionAmount = (total_amount * 5) / 100;
  if (ninthPositionUsers.length > 0) {
    let oneUserAmount = ninthPositionAmount / ninthPositionUsers.length;
    for (let i = 0; i < ninthPositionUsers.length; i++) {
      let curUser = ninthPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ? WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }

  // Distribute 5% among top position users
  let topPositionAmount = (total_amount * 5) / 100;
  if (topPositionUsers.length > 0) {
    let oneUserAmount = topPositionAmount / topPositionUsers.length;
    for (let i = 0; i < topPositionUsers.length; i++) {
      let curUser = topPositionUsers[i];
      await conn.query(
        `UPDATE shoping_users SET total_income = total_income + ? WHERE id = ?`,
        [oneUserAmount, curUser.id]
      );
    }
  }
};

module.exports = subscriptionPaymentHelper;
