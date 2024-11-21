import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Song } from "../types/Song";
import LikeSongButton  from "../components/LikeSongButton"; 

const DailySong = () => {
  const [trackId, setTrackId] = useState<string | null>(null); 
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const { accessToken, logout } = useAuth();

  useEffect(() => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const storedDailySong = localStorage.getItem(`dailySong_${dateKey}`);

    if (storedDailySong) {
      console.log("Dagens låt hittades i Local Storage:", storedDailySong);
      const song = JSON.parse(storedDailySong);
      setCurrentSong(song);
      setTrackId(song.id); 
      return;
    }

    if (!accessToken) {
      console.error("Ingen accessToken tillgänglig, kan inte hämta data.");
      return;
    }

    console.log("Hämtar dagens låt...");

    // Hämta dagens låt och rekommendationer
    fetch(`https://api.spotify.com/v1/recommendations?limit=1`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.tracks && data.tracks.length > 0) {
          const song = data.tracks[0];
          setCurrentSong(song);
          setTrackId(song.id); // Sätt trackId från den rekommenderade låten
          const userId = localStorage.getItem("spotifyUserId");
          if (userId) {
            localStorage.setItem(`dailySong_${userId}_${dateKey}`, JSON.stringify(song));
          }
        }
      })
      .catch((err) => console.error("Ett fel uppstod vid hämtning av dagens låt:", err));
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
      {currentSong ? (
        <div className="song-info">
          <p className="song-name">{currentSong.name}</p>
          <p className="song-artist" style={{color: "#17a74e"}}>{currentSong.artists[0].name}</p>
          <a href={currentSong.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            <img src={currentSong.album.images[0].url} alt="Album art" className="album-art" />
          </a>  
          {accessToken && (
            <LikeSongButton trackId={currentSong.id} accessToken={accessToken} />
          )}
        </div>
      ) : (
        <span className="loader"></span>
      )}
    </div>
  );
};

export default DailySong;
