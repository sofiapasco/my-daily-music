import SpotifyWebApi from 'spotify-web-api-js';

const spotify = new SpotifyWebApi();

// Använd access-token som sparats efter inloggning
export const setAccessToken = (token: string) => {
  spotify.setAccessToken(token);
};

export default spotify;