const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewsmodel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const aws = require("aws-sdk");

aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: "Ankita/" + file.originalname,
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      return resolve(data.Location);
    });
  });
};

// .................................. Create Book  .............................//
const registerBook = async function (req, res) {
  try {
    const data = req.body;

    const user = await userModel.findById(data.userId);
    if (!user)
      return res
        .status(400)
        .send({ status: false, message: "User not exists" });
    try {
      let files = req.files;
      if (files && files.length > 0) {
        let uploadedFileURL = await uploadFile(files[0]);
        data.bookCover = uploadedFileURL;
      } else {
        res.status(400).send({ msg: "No file found" });
      }
    } catch (err) {
      res.status(500).send({ msg: err });
    }

    // authorization
    if (req.headers["userId"] !== user._id.toString())
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized...." });

    const book = await bookModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: book });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Get Book  .............................//
const getBook = async function (req, res) {
  try {
    let { userId, category, subcategory } = req.query;
    let query = { isDeleted: false };
    if (userId && !ObjectId.isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, msg: "UserId is not valid" });
    } else if (userId) query.userId = userId;

    if (category) query.category = category;

    if (subcategory) {
      const newSubcategory = subcategory.split(",").map((ele) => ele.trim());
      query.subcategory = { $all: newSubcategory };
    }

    let book = await bookModel
      .find(query)
      .select({
        ISBN: 0,
        subcategory: 0,
        __v: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
      })
      .collation({ locale: "en" })
      .sort({ title: 1 });

    if (book.length === 0) {
      return res.status(404).send({ status: false, message: "No Book found" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Books List", data: book });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Get Book By Path params .............................//
const getBooksByParams = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (bookId && !ObjectId.isValid(bookId))
      return res
        .status(404)
        .send({ status: false, message: "bookId is invalid" });
    const book = await bookModel.findById(bookId).select({ ISBN: 0, __v: 0 });

    if (!book) {
      return res.status(404).send({ status: false, message: "No book found" });
    } else if (!book.isDeleted) {
      return res
        .status(404)
        .send({ status: false, message: "Book is deleted" });
    }

    let reviewsData = [];
    if (book.reviews !== 0) {
      reviewsData = await reviewModel
        .find()
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    }

    const newBook = book.toJSON();
    delete newBook.isDeleted;

    return res.status(200).send({
      status: true,
      message: "Books List",
      data: { ...newBook, reviewsData: reviewsData },
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Update Book  .............................//
const updateBooks = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (bookId && !ObjectId.isValid(bookId))
      return res
        .status(404)
        .send({ status: false, message: "BookId is not valid" });

    let data = req.body;
    const { title, excerpt, releasedAt, ISBN } = data;

    let bookDetails = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });
    if (!bookDetails)
      return res
        .status(404)
        .send({ status: false, msg: "Book does not exists" });

    //authorization
    let book = await bookModel.findById({ _id: bookId });
    let userId = book.userId.toString();

    if (req.headers["userId"] !== userId)
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized...." });

    if (title) bookDetails.title = title;
    const validTitle = await bookModel.findOne({ title });
    if (validTitle)
      return res
        .status(400)
        .send({ status: false, message: "Title is already present" });

    if (excerpt) bookDetails.excerpt = excerpt;
    if (releasedAt) bookDetails.releasedAt = releasedAt;
    if (ISBN) bookDetails.ISBN = ISBN;
    const validISBN = await bookModel.findOne({ ISBN });
    if (validISBN)
      return res
        .status(400)
        .send({ status: false, message: "ISBN is already present" });

    bookDetails.save();

    return res
      .status(200)
      .send({ status: true, message: "Success", data: bookDetails });
  } catch (error) {
    return res.status(500).send({ err: error.message });
  }
};

// .................................. Delete Book  .............................//
const deleteBook = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (bookId && !ObjectId.isValid(bookId))
      return res
        .status(404)
        .send({ status: false, message: "BookId is not valid" });

    //authorisation
    let book = await bookModel.findById({ _id: bookId });
    if (!book)
      return res
        .status(404)
        .send({ status: false, message: "Book does not exist" });

    let userId = book.userId.toString();
    if (req.headers["userId"] !== userId)
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized...." });

    const deleteBook = await bookModel.findByIdAndUpdate(
      { _id: bookId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: Date.now() } }
    );
    if (!deleteBook)
      return res
        .status(404)
        .send({ status: false, message: "The book does not exist" });
    else if (deleteBook.isDeleted) {
      return res
        .status(404)
        .send({ status: false, message: "The book is already deleted" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "The book is deleted" });
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = {
  registerBook,
  getBook,
  getBooksByParams,
  updateBooks,
  deleteBook,
};
