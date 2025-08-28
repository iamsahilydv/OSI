const createConnectionDb = require("../config/pool");
const { getUserFn } = require("../helpers/authHelper");

const addAddress = async (req, res) => {
  const { id } = req.params;
  const { AddressLine1, AddressLine2, City, State, PostalCode, Country } =
    req.body;
  let token = req.headers.authorization.split(" ");
  token = token[1];
  console.log(token);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Please provide userID",
    });
  } else {
    try {
      const conn = await createConnectionDb({ timeout: 10000 });

      //   validate user
      let user = await conn.query(
        `SELECT * FROM shoping_users WHERE id = ? LIMIT 1`,
        [id]
      );
      user = user[0][0];
      //   console.log(user[0][0]);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "You don't have an account!",
        });
      } else {
        // user is present
        let tokenUser = await getUserFn(token);
        tokenUser = tokenUser.user[0];
        console.log(tokenUser);
        if (tokenUser.id != user.id) {
          // return if user token and sql token doesn't match
          return res.status(400).json({
            success: false,
            message: "User id and token response not match",
          });
        } else {
          let resNumber = await conn.query(
            `SELECT * FROM UserAddresses WHERE userId = ?`,
            [id]
          );
          console.log(`response number`, resNumber[0]);
          console.log(resNumber[0].length);
          if (resNumber[0].length < 5) {
            let response = await conn.query(
              `
                INSERT INTO UserAddresses (userId, AddressLine1, AddressLine2, City, State, PostalCode, Country) VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
              [id, AddressLine1, AddressLine2, City, State, PostalCode, Country]
            );
            //   console.log(response[0]);
            // check response is added or not
            if (response[0].affectedRows == 0) {
              return res.status(400).json({
                success: false,
                message: "Something went wrong Row Not aded In DB",
              });
            } else {
              return res
                .status(200)
                .json({ success: true, message: "Address Added Sucessfully" });
            }
          } else {
            return res.status(400).json({
              success: false,
              message:
                "You already have 5 address saved please Delete for adding New",
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};

const updateAddress = async (req, res) => {
  const { id, AddID } = req.params;
  const { IsDefault } = req.body;
  let token = req.headers.authorization.split(" ");
  token = token[1];
  console.log(token);

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide a UserID" });
  } else if (!AddID) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide a AddressID" });
  } else {
    try {
      const conn = await createConnectionDb({ timeout: 10000 });
      let user = await conn.query(
        `SELECT * FROM shoping_users WHERE id = ? LIMIT 1`,
        [id]
      );
      user = user[0][0];
      //   return if user is not valid
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "You don't have an account " });
      } else {
        let validUser = await getUserFn(token);
        validUser = validUser.user[0];
        // console.log(validUser);
        // return if valid user and DB user not match
        if (validUser.id != user.id) {
          return res.status(400).json({
            success: false,
            message: "User id and token response not match",
          });
        } else {
          let response = await conn.query(
            `
                UPDATE UserAddresses 
                SET IsDefault = CASE 
                                    WHEN id = ? THEN ? 
                                    ELSE FALSE 
                                END 
                WHERE userId = ?;
                `,
            [AddID, IsDefault, id]
          );

          if (response[0].affectedRows == 0) {
            return res
              .status(400)
              .json({ success: false, message: "Response not updated in DB" });
          } else {
            res
              .status(200)
              .json({ success: true, message: "Address State Updated" });
          }
        }
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};

const getAddress = async (req, res) => {
  const { id } = req.params;
  let token = req.headers.authorization;
  token = token.split(" ");
  token = token[1];
  console.log(token);
  //   console.log(id);
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide a userID" });
  } else {
    try {
      const conn = await createConnectionDb({ timeout: 10000 });
      let user = await conn.query(
        `SELECT * FROM shoping_users WHERE id = ? LIMIT 1`,
        [id]
      );
      user = user[0][0];
      //   return if user is not valid
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "You don't have an account " });
      } else {
        let validUser = await getUserFn(token);
        validUser = validUser.user[0];
        // console.log(validUser);
        // return if valid user and DB user not match
        if (validUser.id != user.id) {
          return res.status(400).json({
            success: false,
            message: "User id and token response not match",
          });
        } else {
          let response = await conn.query(
            `
                SELECT * FROM UserAddresses WHERE userId = ? AND isEnabled = TRUE;
                `,
            [id]
          );

          if (response[0].affectedRows == 0) {
            return res
              .status(400)
              .json({ success: false, message: "Response not updated in DB" });
          } else {
            response = response[0];
            res.status(200).json({ success: true, message: response });
          }
        }
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};
const deleteAddress = async (req, res) => {
  const { id, AddID } = req.params;
  let token = req.headers.authorization;
  token = token.split(" ");
  token = token[1];
  console.log(token);
//   console.log("hi");
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide a userID" });
  } else {
    try {
      const conn = await createConnectionDb({ timeout: 10000 });
      let user = await conn.query(
        `SELECT * FROM shoping_users WHERE id = ? LIMIT 1`,
        [id]
      );
      user = user[0][0];
      //   return if user is not valid
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "You don't have an account " });
      } else {
        let validUser = await getUserFn(token);
        validUser = validUser.user[0];
        // console.log(validUser);
        // return if valid user and DB user not match
        if (validUser.id != user.id) {
          return res.status(400).json({
            success: false,
            message: "User id and token response not match",
          });
        } else {
          let response = await conn.query(
            `
            DELETE FROM UserAddresses WHERE id = ? AND userId = ?
            `,
            [AddID, id]
          );

          if (response[0].affectedRows == 0) {
            return res
              .status(400)
              .json({ success: false, message: "Response not updated in DB" });
          } else {
            response = response[0];
            res.status(200).json({
              success: true,
              message: `Address with AddressID ${AddID} is deleted`,
            });
          }
        }
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};

module.exports = {
  addAddress,
  updateAddress,
  getAddress,
  deleteAddress,
};
