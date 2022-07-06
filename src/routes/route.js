const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController");
const validation = require("../validator/validation");

router.post(
  "/register",
  validation.validationForUser,
  userController.registerUser
);
router.post("/books", bookController.registerBook);

router.post("/login", userController.loginUser);

router.get("/books", bookController.getBook);

module.exports = router;
