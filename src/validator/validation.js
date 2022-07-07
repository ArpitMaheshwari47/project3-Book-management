const mongoose = require("mongoose");
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const ObjectId = mongoose.Types.ObjectId;

const isValid = function (value) {
  // Validataion for empty request body
  if (Object.keys(value).length === 0) return false;
  else return true;
};

const isValidValue = function (value) {
  // Validation for Strings/ Empty strings
  if (typeof value !== "string") return false;
  else if (value.trim().length == 0) return false;
  else return true;
};

const validationForUser = async function (req, res, next) {
  try {
    let data = req.body;
    let { title, name, phone, email, password, address } = data;
    phone = phone.trim();
    let allowedTitles = ["Mr", "Mrs", "Miss"];

    if (!isValid(data))
      return res
        .status(400)
        .send({ status: false, message: "Missing Parameters" });

    if (!title)
      return res.status(400).send({ status: false, msg: "Title is required" });
    else if (!isValidValue(title))
      return res
        .status(400)
        .send({ status: false, msg: "Title is in wrong format" });
    else if (!allowedTitles.includes(title))
      return res.status(400).send({
        status: false,
        msg: "Title must be among Mr , Mrs , Miss",
      });

    if (!name)
      return res
        .status(400)
        .send({ status: false, message: "Name is required" });
    else if (!isValidValue(name) || !/^[ a-z ]+$/i.test(name))
      return res
        .status(400)
        .send({ status: false, msg: "Name is in wrong format" });

    if (!phone)
      return res.status(400).send({ status: false, msg: "Phone is required" });
    else if (!/^[6-9]\d{9}$/.test(phone))
      return res.status(400).send({ status: false, msg: "Phone is in wrong" });

    const userPhone = await userModel.findOne({ phone });
    if (userPhone)
      return res.status(400).send({
        status: false,
        message: `${phone} is already in use`,
      });

    if (!email)
      return res.status(400).send({ status: false, msg: "Email is required" });
    else if (!isValidValue(email))
      return res
        .status(400)
        .send({ status: false, msg: "Email is in wrong format" });
    else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
      return res.status(400).send({ status: false, msg: "Invalid email" });

    const userEmail = await userModel.findOne({ email });
    if (userEmail)
      return res.status(400).send({
        status: false,
        message: `${email} is already in use`,
      });

    if (!password)
      return res
        .status(400)
        .send({ status: false, msg: "Password is required" });
    else if (!isValidValue(password))
      return res
        .status(400)
        .send({ status: false, msg: "Password is in wrong format" });
    else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/.test(
        password
      )
    )
      return res.status(400).send({
        status: false,
        msg: "Characters length should be in between 8 and 15 and must contain one special charcter , one alphabet and one number",
      });

    if (!address)
      return res
        .status(400)
        .send({ status: false, message: "address is required" });
    else if (!address.street || !isValidValue(address.street))
      return res.status(400).send({
        status: false,
        message: "Street should be present with correct format",
      });
    else if (
      !address.city ||
      !isValidValue(address.city) ||
      !/^[ a-z ]+$/i.test(address.city)
    )
      return res.status(400).send({
        status: false,
        message: "City should be present with correct format",
      });
    else if (
      !address.pincode ||
      !isValidValue(address.pincode) ||
      !/^(\d{4}|\d{6})$/.test(address.pincode)
    )
      return res.status(400).send({
        status: false,
        message: "Pincode should be present with correct format",
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
  next();
};

const validationForBook = async function (req, res, next) {
  try {
    let data = req.body;
    let {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      reviews,
      isDeleted,
    } = data;

    if (!isValid(data))
      return res
        .status(400)
        .send({ status: false, message: "Missing Parameters" });

    if (!title)
      return res.status(400).send({ status: false, msg: "Title is required" });
    else if (!isValidValue(title))
      return res
        .status(400)
        .send({ status: false, msg: "Title is in wrong format" });

    const newTitle = await bookModel.findOne({ title: title });
    if (newTitle)
      return res
        .status(400)
        .send({ status: false, msg: `${title} is already in use` });

    if (!excerpt)
      return res
        .status(400)
        .send({ status: false, message: "Name is required" });
    else if (!isValidValue(excerpt))
      return res
        .status(400)
        .send({ status: false, msg: "Excerpt is in wrong format" });

    if (!userId)
      return res
        .status(400)
        .send({ status: false, msg: "UserdId is required" });
    else if (!ObjectId.isValid(userId))
      return res
        .status(400)
        .send({ status: false, msg: "UserId is not valid" });

    if (!ISBN)
      return res.status(400).send({ status: false, msg: "ISBN is required" });
    else if (!isValidValue(ISBN))
      return res
        .status(400)
        .send({ status: false, msg: "ISBN is in wrong format" });
    else if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN))
      return res.status(400).send({ status: false, msg: "Invalid ISBN" });

    if (!category)
      return res
        .status(400)
        .send({ status: false, msg: "category is required" });
    else if (!isValidValue(category) || !/^[ a-z ]+$/i.test(category))
      return res
        .status(400)
        .send({ status: false, msg: "Category is in wrong format" });

    if (!subcategory)
      return res
        .status(400)
        .send({ status: false, msg: "Subcategory is required" });
    else if (subcategory.length == 0 || !/^[ a-z ]+$/i.test(category))
      return res
        .status(400)
        .send({ status: false, msg: "Subcategory is in wrong format" });
    else if (reviews && isNaN(reviews))
      return res
        .status(400)
        .send({ status: false, msg: "Reviews is in wrong format" });
    if (isDeleted && typeof isDeleted !== "boolean")
      return res
        .status(400)
        .send({ status: false, msg: "isDeleted is in wrong format" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
  next();
};


module.exports = { validationForUser, validationForBook };
