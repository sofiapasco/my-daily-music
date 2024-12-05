/// <reference types="spotify-web-playback-sdk" />
import { useEffect, useState } from "react";

interface SpotifyPlayerProps {
  accessToken: string;
  currentSong: {
    uri?: string;
    id: string;
  } | null;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ accessToken, currentSong }) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      console.error("Ingen access token tillgänglig.");
      return;
    }

    const initializePlayer = () => {
      if (!window.Spotify) {
        console.error("Spotify Web Playback SDK är inte laddad.");
        return;
      }

      const newPlayer = new window.Spotify.Player({
        name: "My Daily Music Player",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });

      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("Spelare redo med Device ID:", device_id);
        setDeviceId(device_id);
      });      

      console.log("Current song:", currentSong);

      newPlayer.addListener("player_state_changed", (state) => {
        if (!state) {
          console.error("Player state changed, men ingen uppspelningsstatus är tillgänglig.");
        } else {
          console.log("Player state changed:", state);
          console.log("Nuvarande låt:", state.track_window.current_track);
          console.log("Är pausad:", state.paused);
          console.log("Nuvarande position:", state.position);
        }
      });
      
      newPlayer.addListener("initialization_error", ({ message }) => {
        console.error("Initialiseringsfel:", message);
      });

      newPlayer.addListener("authentication_error", ({ message }) => {
        console.error("Autentiseringsfel:", message);
      });

      newPlayer.addListener("account_error", ({ message }) => {
        console.error("Kontofel:", message);
      });

      newPlayer.addListener("playback_error", ({ message }) => {
        console.error("Uppspelningsfel:", message);
      });

      newPlayer.connect().then((success) => {
        if (success) {
          console.log("Spelaren har anslutits framgångsrikt.");
        } else {
          console.error("Misslyckades att ansluta spelaren.");
        }
      });

      setPlayer(newPlayer); 
    };

    window.onSpotifyWebPlaybackSDKReady = initializePlayer;

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken, currentSong]);

  const playTrack = async () => {
    if (!deviceId || !currentSong) {
      console.error("Ingen enhet eller låt tillgänglig.");
      return;
    }

    const trackUri = currentSong.uri || `spotify:track:${currentSong.id}`;
    console.log("Playing track URI:", trackUri);

    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Misslyckades att spela låt:", errorDetails);
        return;
      }

      console.log("Spår spelar nu.");
      setIsPlaying(true);
    } catch (error) {
      console.error("Fel vid uppspelning av spår:", error);
    }
  };

  const togglePlayPause = async () => {
    if (!player) {
      console.error("Spelaren är inte initierad. Kontrollera att den är redo.");
      return;
    }

    const state = await player.getCurrentState();
    if (!state) {
      console.error("Kunde inte hämta uppspelningsstatus. Försöker initiera uppspelning...");
      if (currentSong) {
        await playTrack();
      }
      return;
    }

    if (state.paused) {
      player.resume().then(() => {
        console.log("Uppspelning återupptagen.");
        setIsPlaying(true);
      });
    } else {
      player.pause().then(() => {
        console.log("Uppspelning pausad.");
        setIsPlaying(false);
      });
    }
  };

  return (
    <div>
      {isInitializing ? (
        <p>Laddar Spotify-spelaren...</p>
      ) : (
        <button onClick={togglePlayPause}>
          {isPlaying ? "Pausa" : "Spela"}
        </button>
      )}
    </div>
  );
};

export default SpotifyPlayer;
