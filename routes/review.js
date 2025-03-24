const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js"); 
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewOuther} = require("../middlewere.js");
const reviewController = require("../controllers/reviews.js");





//post Reviews route

router.post("/", isLoggedIn, validateReview,wrapAsync(reviewController.createReview));
 
 //DELETE REVIEW Route
 
 router.delete("/:reviewId",isLoggedIn,isReviewOuther, wrapAsync(reviewController.destroyReview));


 module.exports = router;
 