const express = require('express');
const router = express.Router();
const tierListController = require('../controllers/tierlistController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, tierListController.createTierList);
router.get('/', authMiddleware, tierListController.getTierLists);
router.get('/:id', authMiddleware, tierListController.getTierListById);
router.post('/:id/films', authMiddleware, tierListController.addFilmToTierList);
router.put('/:id/films/order', authMiddleware, tierListController.updateTierListFilmOrder);
router.delete('/:id', authMiddleware, tierListController.deleteTierListController);
router.delete('/:id/films/:film_id', authMiddleware, tierListController.deleteFilmFromTierListController);

module.exports = router;