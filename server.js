require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const app = express();

const CLIENT_ID     = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const PORT          = process.env.PORT || 3000;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('⚠️  CLIENT_ID ou CLIENT_SECRET manquant — vérifie ton .env');
  process.exit(1);
}

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Une playlist Spotify par humeur (remplace par TES ids)
const moodPlaylists = {
  happy:  '37i9dQZF1DXdPec7aLTmlC',  // Happy Hits
  chill:  '37i9dQZF1DX4WYpdgoIcn6',  // Chill Hits
  sad:    '37i9dQZF1DX7qK8ma5wgG1',  // Life Sucks
  energy: '37i9dQZF1DX76Wlfdnj7AP',  // Beast Mode
  fun:    '37i9dQZF1DXaXB8fQg7xif'   // Dance Party
};

// Récupère un token Spotify (client_credentials)
async function getToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await res.json();
  return data.access_token;
}

app.get('/', (req, res) => res.render('index'));

// Renvoie les titres de la playlist correspondant à l'humeur
app.get('/api/playlist', async (req, res) => {
  const playlistId = moodPlaylists[req.query.mood] || moodPlaylists.happy;

  try {
    const token = await getToken();
    if (!token) {
      console.error('❌ Pas de token Spotify — identifiants invalides ?');
      return res.status(502).json({ error: 'auth Spotify échouée' });
    }

    const r = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=30`,
      { headers: { 'Authorization': 'Bearer ' + token } }
    );
    const data = await r.json();

    const tracks = (data.items || [])
      .map(entry => entry.track)
      .filter(t => t)                          // enlève les entrées vides
      .map(t => ({
        title:   t.name,
        artist:  t.artists?.[0]?.name || '',
        cover:   t.album?.images?.[0]?.url || '',
        preview: t.preview_url || null,
        url:     t.external_urls?.spotify || ''
      }));

    console.log(`Mood "${req.query.mood}" → ${tracks.length} titres, ` +
                `${tracks.filter(t => t.preview).length} avec extrait jouable`);

    res.json(tracks);
  } catch (err) {
    console.error('Erreur /api/playlist :', err);
    res.status(500).json({ error: 'erreur serveur' });
  }
});

app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
