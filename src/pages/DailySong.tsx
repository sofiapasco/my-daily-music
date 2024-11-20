import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Song } from "../types/song";

const DailySong = () => {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [knownSong, setKnownSong] = useState<Song | null>(null); 
  const [recommendedSong, setRecommendedSong] = useState<Song | null>(null); 

  useEffect(() => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const storedKnownSong = localStorage.getItem(`knownSong_${dateKey}`);
    const lastAccessedDate = localStorage.getItem("lastAccessedDate");
  
    console.log("Dagens nyckel:", dateKey);
    console.log("Senast besökta datum:", lastAccessedDate);
  
    if (storedKnownSong) {
      console.log("Hämtar låt från localStorage:", storedKnownSong);
      setKnownSong(JSON.parse(storedKnownSong));
    } else if (accessToken) {
      console.log("Hämtar ny låt eftersom dagens låt inte är sparad.");
  
      const topTracksEndpoint = `https://api.spotify.com/v1/me/top/tracks?limit=5`;
      fetch(topTracksEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.items && data.items.length > 0) {
            const topTracks = data.items;
            const randomKnownSong = topTracks[Math.floor(Math.random() * topTracks.length)];
            console.log("Sparar ny känd låt:", randomKnownSong);
            setKnownSong(randomKnownSong);
            localStorage.setItem(`knownSong_${dateKey}`, JSON.stringify(randomKnownSong));
            localStorage.setItem("lastAccessedDate", dateKey);
          } else {
            throw new Error("Inga toppspår hittades för användaren.");
          }
        })
        .catch((error) => {
          console.error("Kunde inte hämta låtar:", error);
        });
    }
  }, [accessToken]);

  const handleLogout = () => {
    localStorage.removeItem("spotifyAccessToken");
    logout();
  };

  return (
    <div className="daily-song-container">
      <button className="logout-btn" onClick={handleLogout}>
        Logga ut
      </button>
      <h1 className="daily-song-title">DAGENS LÅT</h1>

      {knownSong && (
        <div className="known-song">
          <p className="song-name">{knownSong.name}</p>
          <p className="song-artist">{knownSong.artists[0].name}</p>
          <a href={knownSong.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            <img
              src={knownSong.album.images[0].url}
              alt="Album art"
              className="album-art"
            />
          </a>
        </div>
      )}
      {!knownSong && !recommendedSong && <span className="loader"></span>}
    </div>
  );
};

export default DailySong;
