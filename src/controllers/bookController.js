const bookModel = require("../models/bookModel");
const moment = require("moment");

const registerBook = async function (req, res) {
  try {
    let body = req.body;
    const releasedAt = moment(body.releasedAt).format("YYYY-MM-DD");
    if (!moment(releasedAt).isValid())
      return res.status(400).send({ status: false, message: "Invalid input" });

    const book = await bookModel.create(body);
    const newBook = { ...book.toJSON(), releasedAt };
    return res
      .status(201)
      .send({ status: true, message: "Success", data: newBook });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getBook = async function (req, res) {
  try {
    let { userId, category, subcategory } = req.query;
    let params = { isDeleted: false };
    if (userId) params.userId = userId;
    if (category) params.category = category;
    if (subcategory) {
      const newSubcategory = subcategory.split(",").map((ele) => ele.trim());
      params.subcategory = { $all: newSubcategory };
    }
    let book = await bookModel
      .find(params)
      .select({ ISBN: 0, subcategory: 0 ,__v : 0,isDeleted : 0 , createdAt :0 ,updatedAt : 0 })
      .sort({ title: 1 });

    if (book.length == 0) {
      return res.status(404).send({ status: false, message: "No Book found" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Books List", data: book });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { registerBook, getBook };
