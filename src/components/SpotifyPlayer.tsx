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
        transferPlayback(device_id); // Koppla uppspelningen direkt när spelaren är redo
      });

      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Spelare inte redo med Device ID:", device_id);
      });

      newPlayer.connect();
      setPlayer(newPlayer);
    };

    window.onSpotifyWebPlaybackSDKReady = initializePlayer;

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  const transferPlayback = async (device_id: string) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [device_id],
          play: true, // Starta uppspelning direkt
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Misslyckades att överföra uppspelning:", errorDetails);
        return;
      }

      console.log("Uppspelningen har överförts till enheten.");
    } catch (error) {
      console.error("Fel vid överföring av uppspelning:", error);
    }
  };

  const playTrack = async () => {
    if (!deviceId) {
      console.error("Ingen enhets-ID hittades.");
      return;
    }

    const trackUri = currentSong?.uri || `spotify:track:${currentSong?.id}`;
    if (!trackUri) {
      console.error("Ingen giltig URI eller spår-ID för dagens låt.");
      return;
    }

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
        console.error("Misslyckades att spela spår:", errorDetails);
        return;
      }

      console.log("Spår spelar nu.");
    } catch (error) {
      console.error("Fel vid uppspelning av spår:", error);
    }
  };

  return (
    <div>
      <button onClick={playTrack}>Spela låt</button>
    </div>
  );
};

export default SpotifyPlayer;