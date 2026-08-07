// ===================== ÉTAT DE L'APPLICATION =====================
const state = {
  mood: null,          // humeur active
  playlist: [],        // liste des titres du mood courant
  index: 0,            // position dans la playlist
  isPlaying: false,    // lecture en cours ?
  favorites: []        // titres mis en favoris
};

// ===================== RÉFÉRENCES DOM =====================
const trackTitle    = document.getElementById('trackTitle');
const trackArtist   = document.getElementById('trackArtist');
const albumCover    = document.getElementById('albumCover');
const btnPlay       = document.getElementById('btnPlay');
const btnPrev       = document.getElementById('btnPrev');
const btnNext       = document.getElementById('btnNext');
const btnFavorite   = document.getElementById('btnFavorite');
const heartIcon     = btnFavorite.querySelector('.heart-icon');
const favoritesList = document.getElementById('favoritesList');
const moodItems     = document.querySelectorAll('.nav li[id]'); // <li> avec un id (humeurs)

// Élément audio (créé en JS pour la lecture des extraits)
const audio = new Audio();

// ===================== DONNÉES FICTIVES (à remplacer par Spotify) =====================
const mockPlaylists = {
  happy: [
    { title: 'Good Vibes',   artist: 'Sunny Days',  cover: '', preview: '' },
    { title: 'Bright Side',  artist: 'The Smiles',  cover: '', preview: '' }
  ],
  chill: [
    { title: 'Slow Motion',  artist: 'Lofi Beats',  cover: '', preview: '' },
    { title: 'Calm Waters',  artist: 'Relax Co',    cover: '', preview: '' }
  ],
  sad: [
    { title: 'Rainy Night',  artist: 'Blue Mood',   cover: '', preview: '' }
  ],
  energy: [
    { title: 'Full Power',   artist: 'Boost',       cover: '', preview: '' }
  ],
  fun: [
    { title: 'Party Time',   artist: 'The Crew',    cover: '', preview: '' }
  ]
};

// ===================== CHARGEMENT D'UNE HUMEUR =====================
// Point d'entrée unique : renvoie une promesse pour préparer le passage à Spotify.
function fetchPlaylistByMood(mood) {
  // TODO Spotify : remplacer par un appel réel à l'API Spotify.
  return Promise.resolve(mockPlaylists[mood] || []);
}

async function loadMood(mood) {
  state.mood = mood;
  state.index = 0;
  state.playlist = await fetchPlaylistByMood(mood);

  if (state.playlist.length === 0) {
    trackTitle.textContent = 'Aucun titre pour cette humeur';
    trackArtist.textContent = '';
    return;
  }
  renderTrack();
}

// ===================== AFFICHAGE DU TITRE COURANT =====================
function renderTrack() {
  const track = state.playlist[state.index];
  trackTitle.textContent  = track.title;
  trackArtist.textContent = track.artist;
  albumCover.src          = track.cover || '';
  audio.src               = track.preview || '';

  updateFavoriteIcon(); // le cœur reflète l'état de ce titre
  if (state.isPlaying) audio.play();
}

// ===================== LECTURE / PAUSE =====================
function togglePlay() {
  state.isPlaying = !state.isPlaying;
  if (state.isPlaying) {
    audio.play();
    btnPlay.textContent = '⏸️';
  } else {
    audio.pause();
    btnPlay.textContent = '▶️';
  }
}

// ===================== PRÉCÉDENT / SUIVANT =====================
function nextTrack() {
  if (state.playlist.length === 0) return;
  state.index = (state.index + 1) % state.playlist.length; // revient au début
  renderTrack();
}

function prevTrack() {
  if (state.playlist.length === 0) return;
  state.index = (state.index - 1 + state.playlist.length) % state.playlist.length;
  renderTrack();
}

// ===================== FAVORIS =====================
function toggleFavorite() {
  const track = state.playlist[state.index];
  if (!track) return;

  const exists = state.favorites.find(f => f.title === track.title && f.artist === track.artist);
  if (exists) {
    state.favorites = state.favorites.filter(f => f !== exists);
  } else {
    state.favorites.push(track);
  }
  saveFavorites();
  updateFavoriteIcon();
  renderFavorites();
}

function isFavorite(track) {
  return state.favorites.some(f => f.title === track.title && f.artist === track.artist);
}

function updateFavoriteIcon() {
  const track = state.playlist[state.index];
  heartIcon.textContent = (track && isFavorite(track)) ? '❤️' : '🤍';
}

function renderFavorites() {
  favoritesList.innerHTML = ''; // on vide avant de reconstruire
  state.favorites.forEach((track, i) => {
    const li = document.createElement('li');
    li.textContent = `${track.title} — ${track.artist} `;

    const btnRemove = document.createElement('button');
    btnRemove.textContent = '✖';
    btnRemove.addEventListener('click', () => removeFavorite(i));

    li.appendChild(btnRemove);
    favoritesList.appendChild(li);
  });
}

function removeFavorite(i) {
  state.favorites.splice(i, 1);
  saveFavorites();
  updateFavoriteIcon();
  renderFavorites();
}

// ===================== PERSISTANCE (localStorage) =====================
function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(state.favorites));
}

function loadFavorites() {
  const saved = localStorage.getItem('favorites');
  if (saved) state.favorites = JSON.parse(saved);
}

// ===================== ÉCOUTEURS D'ÉVÉNEMENTS =====================
btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', nextTrack);
btnPrev.addEventListener('click', prevTrack);
btnFavorite.addEventListener('click', toggleFavorite);

moodItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    loadMood(item.id); // l'id du <li> (happy, chill, sad...) sert de clé
  });
});

// passe au titre suivant automatiquement quand l'extrait se termine
audio.addEventListener('ended', nextTrack);

// ===================== INITIALISATION =====================
loadFavorites();
renderFavorites();