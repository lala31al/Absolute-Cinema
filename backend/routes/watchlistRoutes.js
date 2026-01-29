const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, watchlistController.getWatchlist);
router.post('/', authMiddleware, watchlistController.addToWatchlist);
router.delete('/:id', authMiddleware, watchlistController.removeFromWatchlist);
router.get('/check/:film_id', authMiddleware, watchlistController.checkWatchlist);

module.exports = router;