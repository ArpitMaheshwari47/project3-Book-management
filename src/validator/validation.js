const validator = require("validator");
const userModel = require("../models/userModel");

const isValid = function (value) {
  if (Object.keys(value).length === 0) return false;
  else return true;
};

const validationForUser = async function (req, res, next) {
  try {
    let data = req.body;
    const { title, name, phone, email, password, address } = data;
    if (!isValid(data))
      return res
        .status(400)
        .send({ status: false, message: "Missing Parameters" });

    if (!title)
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });
    else if (validator.trim(title) == 0)
      return res
        .status(400)
        .send({ status: false, message: "Title should not be empty" });
    let titles = ["Mr", "Mrs", "Miss"];
    if (!titles.includes(title))
      return res.status(400).send({
        status: false,
        message: `Title should be from Mr, Mrs and Miss`,
      });

    if (!name)
      return res
        .status(400)
        .send({ status: false, message: "Name is required" });
    else if (typeof name !== "string" || !validator.isAlpha(name))
      return res
        .status(400)
        .send({ status: false, message: "Name is in wrong format" });

    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: "Phone number is required" });
    else if (!validator.isMobilePhone(phone, ["en-IN"]))
      return res
        .status(400)
        .send({ status: false, message: "Phone number is in wrong format" });

    const userPhone = await userModel.findOne({ phone });
    if (userPhone)
      return res.status(400).send({
        status: false,
        message: `${phone} is already in use`,
      });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Email id is required" });
    else if (!validator.isEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Email is in wrong format" });

    const userEmail = await userModel.findOne({ email });
    if (userEmail)
      return res.status(400).send({
        status: false,
        message: `${email} is already in use`,
      });

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });

    if (password.length > 15 || !validator.isStrongPassword(password)) {
      return res
        .status(400)
        .send({ status: false, message: "Password is in wrong format" });
    }

    if (!address)
      return res
        .status(400)
        .send({ status: false, message: "address is required" });
    else if (!isValid(address))
      return res
        .status(400)
        .send({ status: false, message: "Address is incomplete" });
    else if (
      !address.street ||
      validator.isEmpty(address.street, { ignore_whitespace: true })
    )
      return res
        .status(400)
        .send({ status: false, message: "Street is empty" });
    else if (
      !address.city ||
      typeof address.city !== "string" ||
      !validator.isAlpha(address.city) ||
      validator.isEmpty(address.city, { ignore_whitespace: true })
    )
      return res
        .status(400)
        .send({ status: false, message: "City is in wrong format" });
    else if (
      !address.pincode ||
      !validator.isNumeric(address.pincode) ||
      validator.isEmpty(address.pincode, { ignore_whitespace: true })
    )
      return res
        .status(400)
        .send({ status: false, message: "Pincode is in wrong format" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
  next();
};

module.exports = { validationForUser };
