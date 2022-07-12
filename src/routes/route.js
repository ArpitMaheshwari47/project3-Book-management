const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController");
const reviewController = require("../controllers/reviewController");
const middlewares = require("../middlewares/auth");
const validation = require("../validator/validation");

router.post(
  "/register",
  validation.validationForUser,
  userController.registerUser
);

router.post(
  "/books",
  middlewares.Authentication,
  validation.validationForBook,
  bookController.registerBook
);

router.post("/login", validation.validationForLogin, userController.loginUser);

router.get("/books", middlewares.Authentication, bookController.getBook);
router.get(
  "/books/:bookId",
  middlewares.Authentication,
  bookController.getBooksByParams
);
router.put(
  "/books/:bookId",
  middlewares.Authentication,
  validation.validationForUpdatedBook,
  bookController.updateBooks
);

router.delete(
  "/books/:bookId",
  middlewares.Authentication,
  bookController.deleteBook
);

router.post(
  "/books/:bookId/review",
  validation.validationForReview,
  reviewController.createReviews
);

router.put(
  "/books/:bookId/review/:reviewId",
  validation.validationUpdateReview,
  reviewController.updateReviews
);

router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview);
module.exports = router;
