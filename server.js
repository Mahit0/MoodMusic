const express = require('express');
const app = express();

const SPOTIFY_CLIENT_ID     = 'VOTRE_CLIENT_ID';
const SPOTIFY_CLIENT_SECRET = 'VOTRE_CLIENT_SECRET';

app.set('view engine', 'ejs');   // moteur de gabarits EJS
app.use(express.static('/public')); // sert script.js, style.css, etc.

// Correspondance humeur -> mots-clés
const moodQueries = {
  happy:  'happy feel good',
  chill:  'chill lofi',
  sad:    'sad melancholic',
  energy: 'energetic workout',
  fun:    'party fun'
};

// Page d'accueil rendue via EJS
app.get('/', (req, res) => res.render('index'));

// Route intermédiaire vers Spotify
app.get('/api/playlist', async (req, res) => {
  const query = moodQueries[req.query.mood] || 'pop';

  // 1. Obtenir un jeton d'accès
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const { access_token } = await tokenRes.json();

  // 2. Rechercher des titres correspondant à l'humeur
  const searchRes = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    { headers: { 'Authorization': 'Bearer ' + access_token } }
  );
  const data = await searchRes.json();

  // 3. Reformater proprement pour le front-end
  const tracks = (data.tracks?.items || []).map(item => ({
    title:   item.name,
    artist:  item.artists[0]?.name || '',
    cover:   item.album.images[0]?.url || '',
    preview: item.preview_url || ''
  }));

  res.json(tracks);
});

app.listen(3000, () => console.log('Serveur sur http://localhost:3000'));