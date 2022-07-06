const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController");
const middlewares = require("../middlewares/auth");
const validation = require("../validator/validation");

router.post( "/register",validation.validationForUser,userController.registerUser);

router.post("/books",middlewares.Authentication, bookController.registerBook);

router.post("/login", userController.loginUser);

router.get("/books", bookController.getBook);

module.exports = router;
