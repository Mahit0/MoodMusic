// =============================================================================
//  SERVEUR MOOD MUSIC
//  Rôle : servir la page (rendue avec EJS) et exposer une route intermédiaire
//         qui interroge l'API Spotify sans exposer les identifiants au client.
//  Démarrage : « npm install » puis « npm start ». Node 18+ est requis car on
//              utilise la fonction « fetch » native.
// =============================================================================

// Charge les variables définies dans le fichier .env vers process.env.
// (Le module dotenv est déclaré dans package.json et installé par npm install.)
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();

// -----------------------------------------------------------------------------
// Identifiants Spotify : ils sont lus depuis l'environnement (.env), jamais
// écrits en dur dans le code, afin de ne pas exposer de secret dans le dépôt.
// -----------------------------------------------------------------------------
require('dotenv').config({ path: __dirname + '/.env' });
const CLIENT_ID     = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.set('view engine', 'ejs');                            // moteur de gabarits EJS
app.set('views', path.join(__dirname, 'views'));          // dossier des vues
app.use(express.static(path.join(__dirname, 'public')));  // sert /script.js, /styles.css, etc.

// Correspondance humeur -> mots-clés envoyés à la recherche Spotify.
const moodQueries = {
  happy:  'happy feel good',
  chill:  'chill lofi',
  sad:    'sad melancholic',
  energy: 'energetic workout',
  fun:    'party fun'
};

console.log('--- Vérification config ---');
console.log('CLIENT_ID     :', CLIENT_ID     ? `OK (${CLIENT_ID.length} caractères)` : '❌ MANQUANT');
console.log('CLIENT_SECRET :', CLIENT_SECRET ? `OK (${CLIENT_SECRET.length} caractères)` : '❌ MANQUANT');
console.log('PORT          :', PORT);
console.log('---------------------------');


// Page d'accueil rendue via le gabarit views/index.ejs.
app.get('/', (req, res) => res.render('index'));

// -----------------------------------------------------------------------------
// Route intermédiaire vers Spotify.
// Le navigateur appelle /api/playlist?mood=happy ; le serveur ajoute le secret,
// interroge Spotify, puis renvoie une liste de titres simplifiée au front-end.
// -----------------------------------------------------------------------------
app.get('/api/playlist', async (req, res) => {
  const query = moodQueries[req.query.mood] || 'pop';

  // Si les identifiants ne sont pas configurés, on renvoie une liste vide :
  // le front-end détectera ce cas et affichera ses données de démonstration.
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn('Identifiants Spotify absents : consultez .env.example. Repli sur les données locales.');
    return res.json([]);
  }

  try {
    // 1. Obtenir un jeton d'accès (authentification « client credentials »).
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    if (!tokenRes.ok) throw new Error(`Échec de l'authentification Spotify (${tokenRes.status})`);
    const { access_token } = await tokenRes.json();

    // 2. Rechercher des titres correspondant à l'humeur.
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      { headers: { 'Authorization': 'Bearer ' + access_token } }
    );
    if (!searchRes.ok) throw new Error(`Échec de la recherche Spotify (${searchRes.status})`);
    const data = await searchRes.json();

    // 3. Reformater proprement pour ne transmettre que l'utile au front-end.
    const tracks = (data.tracks?.items || []).map(item => ({
      title:   item.name,
      artist:  item.artists[0]?.name || '',
      cover:   item.album.images[0]?.url || '',
      preview: item.preview_url || ''
    }));

    res.json(tracks);
  } catch (err) {
    // En cas d'erreur réseau ou d'API, on journalise et on renvoie une liste
    // vide (statut 200) pour que le client bascule sur ses données locales.
    console.error('Erreur lors de l\'appel à Spotify :', err.message);
    res.json([]);
  }
});

// -----------------------------------------------------------------------------
// Démarrage. Le port est configurable via .env ; nginx relaiera les requêtes
// vers ce port (proxy_pass http://127.0.0.1:3000).
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur Mood Music démarré sur le port ${PORT}`));
