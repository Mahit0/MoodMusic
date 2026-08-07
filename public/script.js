// =============================================================================
//  MOOD MUSIC — changement de playlist Spotify selon l'humeur
//  Au clic sur un emoji, on remplace la source de l'iframe Spotify par la
//  playlist correspondant à l'humeur choisie.
// =============================================================================

// -----------------------------------------------------------------------------
// Correspondance humeur -> identifiant de playlist Spotify.
// L'identifiant est la portion qui figure dans l'URL d'une playlist :
//   https://open.spotify.com/playlist/<ID>
// Remplacez librement ces valeurs par vos propres playlists.
// -----------------------------------------------------------------------------
const moodPlaylists = {
  home:   '37i9dQZF1DXcBWIGoYBM5M', // Today's Top Hits (playlist par défaut)
  happy:  '37i9dQZF1DXdPec7aLTmlC', // Happy Hits!
  chill:  '37i9dQZF1DX4WYpdgoIcn6', // Chill Hits
  sad:    '37i9dQZF1DX7qK8ma5wgG1', // Sad Songs
  energy: '37i9dQZF1DX76Wlfdnj7AP', // Beast Mode (énergie / sport)
  fun:    '37i9dQZF1DXaXB8fQg7xif'  // Dance Party (festif)
};

// -----------------------------------------------------------------------------
// Références DOM
// -----------------------------------------------------------------------------
const player    = document.getElementById('spotifyPlayer');       // l'iframe
const moodLinks = document.querySelectorAll('.mood-nav .nav-link'); // les emojis

// -----------------------------------------------------------------------------
// Recharge l'iframe sur la playlist de l'humeur demandée.
// -----------------------------------------------------------------------------
function loadMood(mood) {
  const playlistId = moodPlaylists[mood];
  if (!playlistId) return; // humeur inconnue : on ne fait rien

  player.src = `https://open.spotify.com/embed/playlist/${playlistId}`;
}

// -----------------------------------------------------------------------------
// Un clic sur un emoji change la playlist et met l'emoji en évidence.
// L'humeur est lue dans l'attribut data-mood du <li> parent (voir index.ejs).
// -----------------------------------------------------------------------------
moodLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // évite d'ajouter « # » à l'URL

    const mood = link.closest('li')?.dataset.mood;
    if (!mood) return;

    // Met à jour l'état visuel : un seul emoji actif à la fois.
    moodLinks.forEach((l) => l.classList.remove('active'));
    link.classList.add('active');

    loadMood(mood);
  });
});
