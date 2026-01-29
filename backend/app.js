const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/films', require('./routes/filmRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/tierlists', require('./routes/tierlistRoutes'));

app.get('/', (req, res) => {
  res.send('Absolute Cinema API');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});