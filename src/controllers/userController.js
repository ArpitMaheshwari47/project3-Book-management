const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

// .................................. Register User .............................//
const registerUser = async function (req, res) {
  try {
    let body = req.body;
    const user = await userModel.create(body);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: user });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Login User .............................//

const loginUser = async function (req, res) {
  try {
    let email = req.body.email;
    let password = req.body.password;

    const user = await userModel.findOne({ email: email, password: password });
    if (!user) {
      res.status(400).send({ status: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "project3"
    );
      
    res.status(200).send({ status: true, message: "Success", data: token });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser };
