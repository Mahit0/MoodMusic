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

// --- Charge une playlist selon l'humeur ---
async function loadMood(mood) {
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
  renderFavorites();
}

function updateHeart() {
  const t = tracks[index];
  const isFav = t && favorites.some(f => f.title === t.title && f.artist === t.artist);
  btnFavorite.querySelector('.heart-icon').textContent = isFav ? '❤️' : '🤍';
}

function renderFavorites() {
  favoritesList.innerHTML = '';
  favorites.forEach(f => {
    const li = document.createElement('li');
    li.textContent = `${f.title} — ${f.artist}`;
    favoritesList.appendChild(li);
  });
}

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
