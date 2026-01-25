const tmdb = require('../config/tmdb');
const cache = require('../config/node-cache');
const db = require('../config/db');

// HOME
exports.home = async (req, res) => {
    try {
        const cached = cache.get('home_films');
        if (cached) return res.json(cached);

        const [nowPlaying, popular] = await Promise.all([
            tmdb.get('/movie/now_playing'),
            tmdb.get('/movie/popular')
        ]);

        const data = {
            now_playing: nowPlaying.data.results,
            popular: popular.data.results
        };

        cache.set('home_films', data);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// SAVE FILM TO DB (dipakai nanti oleh review/watchlist)
exports.saveFilm = async (req, res) => {
    const { tmdb_id, title, poster, release_date } = req.body;

    try {
        await db.execute(
            `INSERT IGNORE INTO films (tmdb_id, title, poster, release_date)
             VALUES (?,?,?,?)`,
            [tmdb_id, title, poster, release_date]
        );

        res.json({ message: 'Film saved to database' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
