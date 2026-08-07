<<<<<<< HEAD
// --- État ---
let tracks = [];
let index = 0;
let audio = null;
let isPlaying = false;
let favorites = [];

// --- Éléments du DOM ---
const albumCover  = document.getElementById('albumCover');
const trackTitle  = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const btnPlay     = document.getElementById('btnPlay');
const btnPrev     = document.getElementById('btnPrev');
const btnNext     = document.getElementById('btnNext');
const btnFavorite = document.getElementById('btnFavorite');
const favoritesList = document.getElementById('favoritesList');
=======
// =============================================================================
//  SCRIPT MOOD MUSIC (front-end)
//  Rôle : au clic sur un mood, appelle /api/playlist?mood=... (ton serveur
//         Express, qui lui-même interroge Spotify), puis affiche les titres
//         reçus dans le lecteur. Gère play/pause (extrait 30s), suivant/
//         précédent, et les favoris.
// =============================================================================

// ---------- Données de secours si Spotify n'est pas configuré côté serveur ----------
// (server.js renvoie [] quand SPOTIFY_CLIENT_ID / SECRET sont absents)
const FALLBACK_TRACKS = {
  happy:  [{ title: 'Walking on Sunshine', artist: 'Katrina & The Waves', cover: '', preview: '' }],
  chill:  [{ title: 'Weightless',          artist: 'Marconi Union',       cover: '', preview: '' }],
  sad:    [{ title: 'Someone Like You',    artist: 'Adele',               cover: '', preview: '' }],
  energy: [{ title: 'Eye of the Tiger',    artist: 'Survivor',            cover: '', preview: '' }],
  fun:    [{ title: 'Uptown Funk',         artist: 'Bruno Mars',          cover: '', preview: '' }]
};

// ---------- Etat du lecteur ----------
let currentTracks = [];   // titres de la playlist du mood en cours
let currentIndex  = 0;    // position dans currentTracks
let favorites     = [];   // titres ajoutés en favoris (en mémoire)
const audio       = new Audio();

// ---------- Références DOM ----------
const albumCover    = document.getElementById('albumCover');
const trackTitle    = document.getElementById('trackTitle');
const trackArtist   = document.getElementById('trackArtist');
const btnPlay       = document.getElementById('btnPlay');
const btnPrev       = document.getElementById('btnPrev');
const btnNext       = document.getElementById('btnNext');
const btnFavorite   = document.getElementById('btnFavorite');
const favoritesList = document.getElementById('favoritesList');
const moodLinks     = document.querySelectorAll('.mood-nav .nav-link');

// =============================================================================
// 1. CHARGER UNE PLAYLIST QUAND ON CLIQUE SUR UN MOOD
// =============================================================================
moodLinks.forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();

    const li = link.closest('li');
    const mood = li?.dataset.mood;
    if (!mood || mood === 'home') return; // "home" n'est pas un mood musical

    // Met à jour l'état visuel des pills
    moodLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    await loadMood(mood);
  });
});
>>>>>>> ebb0b2b (test)

// --- Charge une playlist selon l'humeur ---
async function loadMood(mood) {
<<<<<<< HEAD
  const res = await fetch(`/api/playlist?mood=${mood}`);
  tracks = await res.json();
  index = 0;

  if (!tracks.length) {
    trackTitle.textContent = 'Aucun titre trouvé';
    trackArtist.textContent = '';
    return;
  }
  showTrack();
}

// --- Affiche le titre courant ---
function showTrack() {
  const t = tracks[index];
  albumCover.src = t.cover;
  trackTitle.textContent = t.title;
  trackArtist.textContent = t.artist;

  stopAudio();
  updateHeart();
}

// --- Lecture / pause ---
function togglePlay() {
  const t = tracks[index];
  if (!t) return;

  if (!t.preview) {
    trackArtist.textContent = t.artist + ' — (pas d\'extrait dispo)';
    return;
  }

  if (isPlaying) {
    stopAudio();
  } else {
    audio = new Audio(t.preview);
    audio.play();
    audio.onended = () => { isPlaying = false; btnPlay.textContent = '▶️'; };
    isPlaying = true;
    btnPlay.textContent = '⏸️';
  }
}

function stopAudio() {
  if (audio) { audio.pause(); audio = null; }
  isPlaying = false;
  btnPlay.textContent = '▶️';
}

// --- Navigation ---
function next() { index = (index + 1) % tracks.length; showTrack(); }
function prev() { index = (index - 1 + tracks.length) % tracks.length; showTrack(); }

// --- Favoris ---
function toggleFavorite() {
  const t = tracks[index];
  if (!t) return;

  const i = favorites.findIndex(f => f.title === t.title && f.artist === t.artist);
  if (i === -1) favorites.push(t);
  else favorites.splice(i, 1);

  updateHeart();
=======
  trackTitle.textContent = 'Chargement...';
  trackArtist.textContent = '';

  try {
    const res = await fetch(`/api/playlist?mood=${encodeURIComponent(mood)}`);
    const tracks = await res.json();

    // Si le serveur n'a pas pu joindre Spotify (pas d'identifiants, erreur API),
    // il renvoie [] : on bascule alors sur les données de démo locales.
    currentTracks = tracks.length > 0 ? tracks : (FALLBACK_TRACKS[mood] || []);
    currentIndex = 0;

    if (currentTracks.length === 0) {
      trackTitle.textContent = 'Aucun titre trouvé';
      trackArtist.textContent = '';
      return;
    }

    playTrackAt(currentIndex);
  } catch (err) {
    console.error('Erreur lors du chargement de la playlist :', err);
    currentTracks = FALLBACK_TRACKS[mood] || [];
    currentIndex = 0;
    if (currentTracks.length > 0) playTrackAt(currentIndex);
  }
}

// =============================================================================
// 2. AFFICHER / JOUER UN TITRE DONNÉ
// =============================================================================
function playTrackAt(index) {
  if (!currentTracks[index]) return;
  currentIndex = index;

  const track = currentTracks[index];
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  albumCover.src = track.cover || '';
  albumCover.alt = track.cover ? `Pochette de ${track.title}` : 'Pas de pochette disponible';

  updateFavoriteButton();

  // Spotify ne fournit un extrait audio (preview_url) que pour certains titres.
  if (track.preview) {
    audio.src = track.preview;
    audio.play();
    setPlayIcon(true);
  } else {
    audio.pause();
    audio.removeAttribute('src');
    setPlayIcon(false);
    console.info(`Pas d'extrait audio disponible pour "${track.title}".`);
  }
}

function setPlayIcon(isPlaying) {
  btnPlay.textContent = isPlaying ? '⏸️' : '▶️';
  btnPlay.setAttribute('aria-label', isPlaying ? 'Pause' : 'Lecture');
}

// =============================================================================
// 3. CONTRÔLES : PLAY/PAUSE, PRÉCÉDENT, SUIVANT
// =============================================================================
btnPlay.addEventListener('click', () => {
  if (!audio.src) return; // rien à lire (pas d'extrait pour ce titre)

  if (audio.paused) {
    audio.play();
    setPlayIcon(true);
  } else {
    audio.pause();
    setPlayIcon(false);
  }
});

btnPrev.addEventListener('click', () => {
  if (currentTracks.length === 0) return;
  const newIndex = (currentIndex - 1 + currentTracks.length) % currentTracks.length;
  playTrackAt(newIndex);
});

btnNext.addEventListener('click', () => {
  if (currentTracks.length === 0) return;
  const newIndex = (currentIndex + 1) % currentTracks.length;
  playTrackAt(newIndex);
});

// Quand l'extrait de 30s se termine, on enchaîne automatiquement sur le suivant.
audio.addEventListener('ended', () => btnNext.click());

// =============================================================================
// 4. FAVORIS
// =============================================================================
btnFavorite.addEventListener('click', () => {
  const track = currentTracks[currentIndex];
  if (!track) return;

  const alreadyFav = favorites.some(f => f.title === track.title && f.artist === track.artist);

  if (alreadyFav) {
    favorites = favorites.filter(f => !(f.title === track.title && f.artist === track.artist));
  } else {
    favorites.push(track);
  }

  updateFavoriteButton();
>>>>>>> ebb0b2b (test)
  renderFavorites();
});

<<<<<<< HEAD
function updateHeart() {
  const t = tracks[index];
  const isFav = t && favorites.some(f => f.title === t.title && f.artist === t.artist);
=======
function updateFavoriteButton() {
  const track = currentTracks[currentIndex];
  const isFav = track && favorites.some(f => f.title === track.title && f.artist === track.artist);
  btnFavorite.classList.toggle('is-favorite', !!isFav);
>>>>>>> ebb0b2b (test)
  btnFavorite.querySelector('.heart-icon').textContent = isFav ? '❤️' : '🤍';
}

function renderFavorites() {
  favoritesList.innerHTML = '';
<<<<<<< HEAD
  favorites.forEach(f => {
    const li = document.createElement('li');
    li.textContent = `${f.title} — ${f.artist}`;
=======

  favorites.forEach((track, i) => {
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.textContent = `${track.title} — ${track.artist}`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.className = 'btn-control';
    removeBtn.setAttribute('aria-label', `Retirer ${track.title} des favoris`);
    removeBtn.addEventListener('click', () => {
      favorites.splice(i, 1);
      updateFavoriteButton();
      renderFavorites();
    });

    li.appendChild(label);
    li.appendChild(removeBtn);
>>>>>>> ebb0b2b (test)
    favoritesList.appendChild(li);
  });
}

<<<<<<< HEAD
// --- Branchement des boutons ---
btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);
btnFavorite.addEventListener('click', toggleFavorite);

// Boutons d'humeur (les <li> du header)
document.querySelectorAll('.nav-pills li').forEach(li => {
  li.addEventListener('click', (e) => {
    e.preventDefault();
    const mood = li.id;
    if (mood === 'home') return;

    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    li.querySelector('.nav-link').classList.add('active');

    loadMood(mood);
  });
});

// Charge une humeur par défaut au démarrage
loadMood('happy');
=======
// =============================================================================
// 5. CHARGEMENT INITIAL (mood "happy" par défaut, ou adapte selon ton besoin)
// =============================================================================
loadMood('happy');
>>>>>>> ebb0b2b (test)
