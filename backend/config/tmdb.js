require('dotenv').config();
const axios = require('axios');

const tmdb = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        Accept: 'application/json'
    }
});

module.exports = tmdb;