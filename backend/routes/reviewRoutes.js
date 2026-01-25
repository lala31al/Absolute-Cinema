const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

// add review (login required)
router.post('/', authMiddleware, reviewController.addReview);

// get reviews by film
router.get('/film/:film_id', reviewController.getReviewsByFilm);

// delete review (owner only)
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
