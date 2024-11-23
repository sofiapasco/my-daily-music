import SpotifyWebApi from "spotify-web-api-js";

const spotify = new SpotifyWebApi();

/**
 * Sätter access-token för Spotify API.
 * @param token - Access-token från autentisering.
 */
export const setAccessToken = (token: string) => {
  spotify.setAccessToken(token);
};

/**
 * Hämtar användarens Spotify-profil.
 * @returns Promise med användarprofilinformation.
 */
export const getUserProfile = async () => {
  try {
    const profile = await spotify.getMe();
    return {
      email: profile.email,
      displayName: profile.display_name,
      id: profile.id,
    };
  } catch (error) {
    console.error("Kunde inte hämta användarprofil:", error);
    throw error;
  }
};

/**
 * Söker efter låtar, album eller artister.
 * @param query - Söksträng.
 * @param type - Typen av sökning (artist, album, track).
 * @returns Promise med sökresultat.
 */
export const searchSpotify = async (
  query: string,
  type: "artist" | "album" | "track"
) => {
  try {
    const results = await spotify.search(query, [type]);
    return results;
  } catch (error) {
    console.error("Kunde inte söka på Spotify:", error);
    throw error;
  }
};

/**
 * Hämtar användarens spellistor.
 * @returns Promise med spellistor.
 */
export const getUserPlaylists = async () => {
  try {
    const playlists = await spotify.getUserPlaylists();
    return playlists;
  } catch (error) {
    console.error("Kunde inte hämta spellistor:", error);
    throw error;
  }
};

/**
 * Hämtar användarens toppspår.
 * @returns Promise med användarens toppspår.
 */
export const getUserTopTracks = async () => {
  try {
    const topTracks = await spotify.getMyTopTracks();
    return topTracks;
  } catch (error) {
    console.error("Kunde inte hämta toppspår:", error);
    throw error;
  }
};

/**
 * Hämtar användarens senast spelade låtar.
 * @returns Promise med nyligen spelade låtar.
 */
export const getRecentlyPlayed = async () => {
  try {
    const recentlyPlayed = await spotify.getMyRecentlyPlayedTracks();
    return recentlyPlayed;
  } catch (error) {
    console.error("Kunde inte hämta nyligen spelade låtar:", error);
    throw error;
  }
};

/**
 * Sparar en låt i användarens bibliotek.
 * @param trackId - ID för låten att spara.
 */
export const saveTrack = async (trackId: string) => {
  try {
    await spotify.addToMySavedTracks([trackId]);
    console.log("Låt tillagd i biblioteket!");
  } catch (error) {
    console.error("Kunde inte lägga till låten i biblioteket:", error);
    throw error;
  }
};

/**
 * Kontrollera om en låt är sparad i användarens bibliotek.
 * @param trackId - ID för låten att kontrollera.
 * @returns Promise med boolean värde.
 */
export const isTrackSaved = async (trackId: string) => {
  try {
    const [isSaved] = await spotify.containsMySavedTracks([trackId]);
    return isSaved;
  } catch (error) {
    console.error("Kunde inte kontrollera om låten är sparad:", error);
    throw error;
  }
};

/**
 * Hämtar rekommendationer från Spotify API.
 * @param seedTracks - Array av låt-ID:n att använda som seeds.
 * @returns Promise med rekommenderade spår.
 */
export const getRecommendations = async (seedTracks: string[]) => {
  try {
    const recommendations = await spotify.getRecommendations({
      seed_tracks: seedTracks,
      limit: 10,
    });
    return recommendations.tracks;
  } catch (error) {
    console.error("Kunde inte hämta rekommendationer:", error);
    throw error;
  }
};

export default {
  setAccessToken,
  getUserProfile,
  searchSpotify,
  getUserPlaylists,
  getUserTopTracks,
  getRecentlyPlayed,
  saveTrack,
  isTrackSaved,
  getRecommendations,
};
