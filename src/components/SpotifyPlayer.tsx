/// <reference types="spotify-web-playback-sdk" />
import { useEffect, useState } from "react";
import ProgressBar from "../components/ProgressBar";

interface SpotifyPlayerProps {
  accessToken: string;
  currentSong: {
    uri?: string;
    id: string;
  } | null;
  onReady?: (deviceId: string) => void; 
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  accessToken,
  currentSong,
  onReady, 
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
          const currentTrackUri = state.track_window.current_track.uri;
          const expectedTrackUri = currentSong?.uri || `spotify:track:${currentSong?.id}`;
      
          if (currentTrackUri !== expectedTrackUri) {
            console.warn("En annan låt spelas. Förväntad URI:", expectedTrackUri);
          } else {
            console.log("Dagens låt spelar korrekt:", currentTrackUri);
          }
      
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
    console.log("Försöker spela dagens låt med URI:", trackUri);
  
    try {
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
  
      const playResponse = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri], 
        }),
      });
  
      if (!playResponse.ok) {
        const errorDetails = await playResponse.json();
        console.error("Misslyckades att spela dagens låt:", errorDetails);
        return;
      }
  
      console.log("Dagens låt spelar nu.");
      setIsPlaying(true);
    } catch (error) {
      console.error("Fel vid uppspelning av dagens låt:", error);
    }
  };  
  
  const togglePlayPause = async () => {
    if (!player) {
      console.error("Spelaren är inte initierad. Kontrollera att den är redo.");
      return;
    }
  
    const state = await player.getCurrentState();
    if (!state) {
      console.error("Ingen aktiv uppspelningsstatus hittades. Initierar uppspelning av dagens låt...");
      if (currentSong) {
        await playTrack(); 
      }
      return;
    }
  
    if (state.paused) {
      if (state.track_window.current_track.uri !== currentSong?.uri) {
        console.log("En annan låt spelas. Växlar till dagens låt...");
        await playTrack(); // Starta dagens låt
      } else {
        player.resume().then(() => {
          console.log("Uppspelning återupptagen.");
          setIsPlaying(true);
        });
      }
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
    
        const position = state.position; // Millisekunder
        const duration = state.duration; // Millisekunder
    
        setCurrentTime(formatTime(position));
        setDuration(formatTime(duration));
        setProgress((position / duration) * 100);
    
        console.log("Position:", position, "Duration:", duration, "Progress:", (position / duration) * 100);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [player]);
  
  const formatTime = (ms:number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player) return;
  
    player.getCurrentState().then((state) => {
      if (!state) return;
  
      const rect = e.currentTarget.getBoundingClientRect(); // Get the progress bar's dimensions
      const clickX = e.clientX - rect.left; // Click position in pixels
      const newPosition = (clickX / rect.width) * state.duration; // Calculate the new position in milliseconds
  
      player.seek(newPosition).then(() => {
        console.log(`Hoppade till ${formatTime(newPosition)}`);
      });
    });

  };
  
  return (
<div className="spotify-player">
  {isInitializing ? (
    <p></p>
  ) : (
    <>
      <div className="player-controls">
        <button className="control-button" onClick={togglePlayPause}>
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          progress={progress}
          onSeek={handleSeek}
        />
      </div>
    </>
  )}
</div>
  );
};

export default SpotifyPlayer;
