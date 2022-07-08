const mongoose = require("mongoose");
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");

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

const azValid = function (value) {
  if (!/^[ a-z ]+$/i.test(value)) return false;
  else return true;
};

const validationForUser = async function (req, res, next) {
  try {
    let data = req.body;
    let { title, name, phone, email, password, address } = data;

    let allowedTitles = ["Mr", "Mrs", "Miss"];

    if (!isValid(data))
      return res
        .status(400)
        .send({ status: false, message: "Missing Parameters" });

    if (!title)
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });
    else if (!isValidValue(title))
      return res
        .status(400)
        .send({ status: false, message: "Title is in wrong format" });
    else if (!allowedTitles.includes(title))
      return res.status(400).send({
        status: false,
        message: "Title must be among Mr , Mrs , Miss",
      });

    if (!name)
      return res
        .status(400)
        .send({ status: false, message: "Name is required" });
    else if (!isValidValue(name) || !azValid(name))
      return res
        .status(400)
        .send({ status: false, message: "Name is in wrong format" });

    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: "Phone is required" });
    let phoneNumber = phone.trim();
    if (!/^[6-9]\d{9}$/.test(phoneNumber))
      return res
        .status(400)
        .send({ status: false, message: "Phone is in wrong format" });

    const userPhone = await userModel.findOne({ phone: phoneNumber });
    if (userPhone)
      return res.status(400).send({
        status: false,
        message: `${phone} is already in use`,
      });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Email is required" });
    let emailId = email.trim();
    if (!isValidValue(emailId))
      return res
        .status(400)
        .send({ status: false, message: "Email is in wrong format" });
    else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailId))
      return res.status(400).send({ status: false, message: "Invalid email" });

    const userEmail = await userModel.findOne({ email: emailId });
    if (userEmail)
      return res.status(400).send({
        status: false,
        message: `${email} is already in use`,
      });

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });
    else if (!isValidValue(password))
      return res
        .status(400)
        .send({ status: false, message: "Password is in wrong format" });
    else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/.test(
        password
      )
    )
      return res.status(400).send({
        status: false,
        message:
          "Characters length should be in between 8 and 15 and must contain one special charcter , one alphabet and one number",
      });

    if (address && !isValid(address))
      return res
        .status(400)
        .send({ status: false, message: "address is required" });
    if (address.street && !isValidValue(address.street))
      return res.status(400).send({
        status: false,
        message: "Street should be present with correct format",
      });
    else if (
      (address.city && !isValidValue(address.city)) ||
      !azValid(address.city)
    )
      return res.status(400).send({
        status: false,
        message: "City should be present with correct format",
      });
    else if (
      address.pincode &&
      !isValidValue(address.pincode) &&
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
      releasedAt,
      reviews,
      isDeleted,
    } = data;

    if (!isValid(data))
      return res
        .status(400)
        .send({ status: false, message: "Missing Parameters" });

    if (!title)
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });
    else if (!isValidValue(title))
      return res
        .status(400)
        .send({ status: false, message: "Title is in wrong format" });

    const newTitle = await bookModel.findOne({ title: title });
    if (newTitle)
      return res
        .status(400)
        .send({ status: false, message: `${title} is already in use` });

    if (!excerpt)
      return res
        .status(400)
        .send({ status: false, message: "Excerpt is required" });
    else if (!isValidValue(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "Excerpt is in wrong format" });

    if (!userId)
      return res
        .status(400)
        .send({ status: false, message: "UserdId is required" });
    else if (!ObjectId.isValid(userId))
      return res
        .status(400)
        .send({ status: false, message: "UserId is not valid" });

    if (!ISBN)
      return res
        .status(400)
        .send({ status: false, message: "ISBN is required" });
    else if (!isValidValue(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "ISBN is in wrong format" });
    else if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN))
      return res.status(400).send({ status: false, message: "Invalid ISBN" });

    const getISBN = await bookModel.findOne({ ISBN });
    if (getISBN)
      return res
        .status(400)
        .send({ status: false, message: "ISBN Already exists" });

    if (!category)
      return res
        .status(400)
        .send({ status: false, message: "category is required" });
    else if (!isValidValue(category) || !azValid(category))
      return res
        .status(400)
        .send({ status: false, message: "Category is in wrong format" });

    if (!subcategory)
      return res
        .status(400)
        .send({ status: false, message: "Subcategory is required" });
    else if (subcategory.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Subcategory should not be empty" });
    else {
      let isValidsubcategory = true;
      subcategory.forEach((sub) => {
        isValidsubcategory &&= azValid(sub);
      });
      if (!isValidsubcategory)
        return res
          .status(400)
          .send({ status: false, message: "Subcategory is in wrong format" });
    }

    if (!releasedAt)
      return res
        .status(400)
        .send({ status: false, message: "releasedAt is required" });

    if (!moment(releasedAt).isValid())
      return res.status(400).send({ status: false, message: "Invalid Parameter" });

    if (reviews && isNaN(reviews))
      return res
        .status(400)
        .send({ status: false, message: "Reviews is in wrong format" });

    if (isDeleted && typeof isDeleted !== "boolean")
      return res
        .status(400)
        .send({ status: false, message: "isDeleted is in wrong format" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
  next();
};

const validationForUpdatedBook = async function (req, res, next) {
  try {
    let data = req.body;
    let { title, excerpt, releasedAt, ISBN } = data;

    if (!isValid(data))
      return res
        .status(400)
        .send({ status: false, message: "Missing Parameters" });

    if (title && !isValidValue(title))
      return res
        .status(400)
        .send({ status: false, message: "Title is wrong format" });

    if (excerpt && !isValidValue(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "excerpt is in wrong format" });

    if (releasedAt && !isValidValue(releasedAt))
      return res
        .status(400)
        .send({ status: false, message: "releasedAt is in wrong format" });

    if (ISBN && !isValidValue(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "ISBN is in wrong format" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
  next();
};

module.exports = {
  validationForUser,
  validationForBook,
  isValid,
  isValidValue,
  validationForUpdatedBook,
};
