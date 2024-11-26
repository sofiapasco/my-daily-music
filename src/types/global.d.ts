/// <reference types="spotify-web-playback-sdk" />

declare global {
  interface Window {
    Spotify: {
      Player: typeof Spotify.Player;
    };
  }
}
