const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewsmodel");
const { getBook } = require("./bookController");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// .................................. Create Reviews  .............................//
const createReviews = async function (req, res) {
  try {
    let body = req.body;
    let bookId = req.params.bookId;

    body.bookId = bookId;
    if (!body.reviewedBy) body.reviewedBy = "Guest";
    else {
      body.reviewedBy;
    }
    body.reviewedAt = new Date().toISOString();

    const review = await reviewModel.create(body);

    const newReview = {
      _id: review._id,
      bookId: bookId,
      reviewedBy: body.reviewedBy,
      reviewedAt: body.reviewedAt,
      rating: body.rating,
      review: body.review,
    };
    const booksId = await bookModel.findById({ _id: bookId });
    if (!booksId)
      return res
        .status(400)
        .send({ status: false, message: "Book is not exist" });

    if (booksId.isDeleted)
      return res
        .status(400)
        .send({ status: false, message: "Book is deleted" });

    const bookReviews = await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { $inc: { reviews: 1 } },
      { new: true }
    );
    bookReviews.reviewsData = review;

    // const reviewsDetails = { ...bookReviews.toJSON(), reviewsData: review };
    return res
      .status(201)
      .send({ status: true, message: "Success", data: newReview });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Update Reviews .............................//
const updateReviews = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;

    let data = req.body;
    const { rating, review, reviewedBy } = data;

    let bookData = await bookModel.findOne({ _id: bookId, isDeleted: false });

    if (!bookData)
      return res.status(404).send({
        status: false,
        msg: "The book is deleted so we can't give any review",
      });

    let reviewData = await reviewModel.findOneAndUpdate(
      { _id: reviewId, bookId: bookData._id.toString(), isDeleted: false },
      { $set: { rating, review, reviewedBy } },
      { new: true }
    );

    if (!reviewData)
      return res
        .status(404)
        .send({ status: false, msg: "The book is not reviewed" });

    res
      .status(200)
      .send({ status: true, message: "Success", data: reviewData });
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
};

// .................................. Delete Reviews  .............................//
const deleteReview = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;

    if (!ObjectId.isValid(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "BookId is not valid" });
    }

    if (!ObjectId.isValid(reviewId)) {
      return res
        .status(400)
        .send({ status: false, message: "ReviewId is not valid" });
    }

    const bookDetails = await bookModel.findOneAndUpdate(
      { _id: bookId },
      { $inc: { reviews: -1 } },
      { new: true }
    );
    if (!bookDetails)
      return res
        .status(404)
        .send({ status: false, message: "The book is not exist" });

    const reviewDetails = await reviewModel.findOne({
      _id: reviewId,
      bookId: bookDetails._id.toString(),
    });
    if (!reviewDetails)
      return res
        .status(404)
        .send({ status: false, message: "Review does not exist" });
    else if (reviewDetails.isDeleted)
      return res
        .status(200)
        .send({ status: false, message: "The review is already deleted" });
    else {
      reviewDetails.isDeleted = true;
      reviewDetails.save();
      return res
        .status(200)
        .send({ status: true, data: "The review is deleted" });
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};
module.exports = { createReviews, updateReviews, deleteReview };
