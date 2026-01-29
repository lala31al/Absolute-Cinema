const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, ratingController.upsertRating);
router.get('/film/:film_id', 
    (req, res, next) => {
        if(!req.headers.authorization) return ratingController.getFilmRating(req, res);
        next();
    }, 
    authMiddleware, 
    ratingController.getFilmRating
);

router.delete('/film/:film_id', authMiddleware, ratingController.deleteRating);

module.exports = router;