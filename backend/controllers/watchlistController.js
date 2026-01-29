const watchlistModel = require('../models/watchlistModel');
const filmModel = require('../models/filmModel');

exports.addToWatchlist = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { tmdb_id, title, poster_path } = req.body;

    if (!tmdb_id || !title) {
      return res.status(400).json({ message: 'tmdb_id and title required' });
    }

    let film = await filmModel.findByTmdbId(tmdb_id);

    if (!film) {
      await filmModel.insertFilm({
        tmdb_id,
        title,
        poster: poster_path,
        release_date: null,
        duration: null,
        genres: null
      });

      film = await filmModel.findByTmdbId(tmdb_id);
    }

    const insertedId = await watchlistModel.addWatchlist({
      user_id,
      film_id: film.film_id, 
      title,
      poster_path
    });

    if (!insertedId) {
      return res.status(409).json({ message: 'Already in watchlist' });
    }

    res.status(201).json({
      message: 'Added to watchlist',
      watchlist_id: insertedId
    });

  } catch (err) {
    console.error('ADD WATCHLIST ERROR:', err);
    res.status(500).json({ message: 'Failed to add to watchlist' });
  }
};

exports.getWatchlist = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const data = await watchlistModel.getWatchlistByUser(user_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get watchlist',
      error: error.message
    });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    const deleted = await watchlistModel.deleteWatchlist(id, user_id);

    if (deleted === 0) {
      return res.status(404).json({
        message: 'Watchlist not found'
      });
    }

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to remove watchlist',
      error: error.message
    });
  }
};

exports.checkWatchlist = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { film_id } = req.params;

    const film = await filmModel.findByTmdbId(film_id);

    if (!film) {
      return res.json({ in_watchlist: false, watchlist_id: null });
    }

    const item = await watchlistModel.isInWatchlist(user_id, film.film_id);

    res.json({
      in_watchlist: !!item,
      watchlist_id: item?.watchlist_id || null
    });
  } catch (error) {
    console.error('CHECK WATCHLIST ERROR:', error);
    res.status(500).json({ message: 'Failed to check watchlist' });
  }
};