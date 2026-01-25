const express = require('express');
const router = express.Router();
const filmController = require('../controllers/filmController');

router.get('/home', filmController.home);
router.post('/save', filmController.saveFilm);

module.exports = router;
