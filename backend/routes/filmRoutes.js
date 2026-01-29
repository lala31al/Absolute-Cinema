const express = require('express');
const router = express.Router();
const filmController = require('../controllers/filmController');

router.get('/search', filmController.searchFilms);
router.post('/', filmController.createFilm); 
router.get('/home', filmController.getHome);
router.get('/:id', filmController.getFilmDetail);

module.exports = router;