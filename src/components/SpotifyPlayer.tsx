/// <reference types="spotify-web-playback-sdk" />
import { useEffect, useState } from "react";

interface SpotifyPlayerProps {
  accessToken: string;
  currentSong: {
    uri?: string;
    id: string;
  } | null;
  onReady?: (deviceId: string) => void; // Lägg till onReady här
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  accessToken,
  currentSong,
  onReady, // Lägg till denna parameter
}) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log("Kontrollerar om Spotify SDK är laddad...");
    
    const initializePlayer = () => {
      console.log("Initierar Spotify-spelaren...");
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
        setIsInitializing(false);
        if (onReady) {
          onReady(device_id);
        }
      });
  
      newPlayer.addListener("player_state_changed", (state) => {
        if (state) {
          console.log("Player state changed:", state);
          setIsPlaying(!state.paused);
        }
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
  
    if (window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }
  
    return () => {
      if (player) {
        console.log("Kopplar från Spotify-spelaren...");
        player.disconnect();
      }
    };
  }, [accessToken]); // Lägg endast `accessToken` som beroende
  
  const playTrack = async () => {
    if (!deviceId || !currentSong) {
      console.error("Ingen enhet eller låt tillgänglig.");
      return;
    }
  
    const trackUri = currentSong.uri || `spotify:track:${currentSong.id}`;
    console.log("Playing track URI:", trackUri);
  
    try {
      // Välj spelaren som aktiv enhet
      const transferResponse = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: true,
        }),
      });
  
      if (!transferResponse.ok) {
        const errorDetails = await transferResponse.json();
        console.error("Misslyckades att välja enhet:", errorDetails);
        return;
      }
  
      // Starta låten
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

  useEffect(() => {
    if (!player) return;
  
    const interval = setInterval(() => {
      player.getCurrentState().then((state) => {
        if (!state) return;
  
        const position = state.position; // Milliseconds
        const duration = state.duration; // Milliseconds
  
        setCurrentTime(formatTime(position));
        setDuration(formatTime(duration));
        setProgress((position / duration) * 100);
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, [player]);
  
  const formatTime = (ms:number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
<div className="spotify-player">
  {isInitializing ? (
    <p>Laddar Spotify-spelaren...</p>
  ) : (
    <>
      <div className="player-controls">
        <button className="control-button" onClick={togglePlayPause}>
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <div className="progress-container">
          <span className="current-time">{currentTime}</span>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="duration">{duration}</span>
        </div>
      </div>
    </>
  )}
</div>


  );
};

export default SpotifyPlayer;
