const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController");
const reviewController = require("../controllers/reviewController");
const middlewares = require("../middlewares/auth");
const validation = require("../validator/validation");
const aws = require("aws-sdk");

aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1"
})

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {

    let s3 = new aws.S3({ apiVersion: '2006-03-01' });

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",  //HERE
      Key: "ankita/" + file.originalname, //HERE 
      Body: file.buffer
    }


    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ "error": err })
      }
      console.log(data)
      console.log("file uploaded succesfully")
      return resolve(data.Location)
    })



  })
}

// router.post("/write-file-aws", async function (req, res) {

//   try {
//     // let body = req.body
//     let files = req.files
//     console.log(files)
//     if (files && files.length > 0) {

//       let uploadedFileURL = await uploadFile(files[0])
//       // body.bookCover = uploadedFileURL
//       res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL })
//     }
//     else {
//       res.status(400).send({ msg: "No file found" })
//     }

//   }
//   catch (err) {
//     res.status(500).send({ msg: err })
//   }

// })



router.post(
  "/register",
  validation.validationForUser,
  userController.registerUser
);

router.post(
  "/books",
  middlewares.Authentication,
  validation.awsCreate,
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
