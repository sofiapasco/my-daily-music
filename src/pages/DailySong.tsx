import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Song } from "../types/song";

const DailySong = () => {
  const { accessToken } = useAuth();
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    if (accessToken) {
      const today = new Date();
      const dayIdentifier = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

      // Hämta användarens toppspår från Spotify och välj en låt baserat på dagens identifierare
      fetch("https://api.spotify.com/v1/me/top/tracks?limit=50", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.items && data.items.length > 0) {
            const songIndex = dayIdentifier.split("-").reduce((sum, num) => sum + parseInt(num, 10), 0) % data.items.length;
            setSong(data.items[songIndex]);
          }
        })
        .catch((error) => console.error("Error fetching top tracks:", error));
    }
  }, [accessToken]);

  return (
    <div className="daily-song-container">
      <h1 className="daily-song-title">DAGENS LÅT</h1>
      {song ? (
        <div className="song-info">
          <p className="song-name">{song.name}</p>
          <p className="song-artist">{song.artists[0].name}</p>
          <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">
          <img
            src={song.album.images[0].url}
            alt="Album art"
            className="album-art"
          />
        </a>
        </div>
      ) : (
        <span className="loader"></span> 
      )}
    </div>
  );
};

export default DailySong;