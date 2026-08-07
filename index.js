require('dotenv').config(); // ou import 'dotenv/config' en ES module

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

console.log("Client ID chargé :", clientId);

