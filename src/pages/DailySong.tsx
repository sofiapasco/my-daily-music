import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Song } from "../types/Song";
import LikeSongButton  from "../components/LikeSongButton"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DailySong = () => {
  const [trackId, setTrackId] = useState<string | null>(null); 
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const { accessToken, logout } = useAuth();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);

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
  useEffect(() => {
    const storedLikedSongs = localStorage.getItem("likedSongs");
    if (storedLikedSongs) {
      setLikedSongs(JSON.parse(storedLikedSongs));
    }
  }, []);

  useEffect(() => {
    const storedLikedSongs = localStorage.getItem("likedSongs");
    if (storedLikedSongs) {
      setLikedSongs(JSON.parse(storedLikedSongs));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("spotifyAccessToken");
    logout();
  };

  return (
    <>
      <div className="daily-song-container">
        <button className="logout-btn" onClick={handleLogout}>
          Logga ut
        </button>
        <h1 className="daily-song-title">DAGENS LÅT</h1>
        {currentSong ? (
         <div className="song-info">
         <p className="song-name">{currentSong.name}</p>
         <p className="song-artist" style={{ color: "#17a74e" }}>
           {currentSong.artists[0].name}
         </p>
         <div className="album-and-like">
           <a href={currentSong.external_urls.spotify} target="_blank" rel="noopener noreferrer">
             <img src={currentSong.album.images[0].url} 
                alt="Album art" 
                className="album-art" 
                />
           </a>
           <LikeSongButton
          currentSong={currentSong}
          likedSongs={likedSongs}
          setLikedSongs={setLikedSongs}
          className="like-heart"
        />
        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
         </div>
       </div>
        ) : (
          <span className="loader"></span>
        )}
      </div>
      
      <div className="liked-songs-section">
          <h2 className="likedSong">Sparade låtar:</h2>
        <ul>
          {likedSongs.map((song) => (
            <li key={song.id}>
              {song.name} av {song.artists[0].name}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
  
};

export default DailySong;
