const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, reviewController.upsertReview);
router.put('/:id', authMiddleware, reviewController.upsertReview);

router.get('/film/:film_id', authMiddleware, reviewController.getReviewsByFilm);
router.get('/user/:user_id', reviewController.getReviewsByUser);
router.get('/:id', reviewController.getReviewById);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;