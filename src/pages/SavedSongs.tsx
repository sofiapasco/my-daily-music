import { useEffect, useState } from "react";
import { Track } from "../types/Song";
import { useAuth } from "../context/AuthContext";
import DeleteButton from "../components/DeleteButton";
import { ToastContainer, toast } from "react-toastify";
import UserMenu from "../components/UserMenu"
import "react-toastify/dist/ReactToastify.css";

const SavedSongs: React.FC = () => {
  const [savedSongs, setSavedSongs] = useState<Track[]>([]);
  const {  logout } = useAuth();

  useEffect(() => {
    const storedLikedSongs = localStorage.getItem("likedSongs");
    if (storedLikedSongs) {
      setSavedSongs(JSON.parse(storedLikedSongs));
    }
  }, []);

  const handleDelete = (songId: string) => {
    // Filtrera bort den raderade låten från listan
    const updatedSavedSongs = savedSongs.filter((song) => song.id !== songId);
    setSavedSongs(updatedSavedSongs);

    // Uppdatera localStorage
    localStorage.setItem("likedSongs", JSON.stringify(updatedSavedSongs));

    // Visa en bekräftelse-toast
    toast.error("Låten har tagits bort från dina sparade låtar!");
  };

  const handleLogout = () => {
    localStorage.removeItem("spotifyAccessToken");
    logout();
  };

  return (
    <div className="saved-songs-container">
      <h1>Alla sparade låtar:</h1>
      <UserMenu />
      <button className="logout-btn" onClick={handleLogout}>
          Logga ut
        </button>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      {savedSongs.length > 0 ? (
        <div className="gallery-container">
          {savedSongs.map((song) => (
            <div className="gallery-item" key={song.id}>
              <a
                href={song.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={song.album?.images?.[0]?.url || "/path/to/default-image.jpg"}
                  alt={`${song.name} album art`}
                  className="gallery-image"
                />
              </a>
              <p className="song-name">{song.name}</p>
              <p className="song-artist">{song.artists[0].name}</p>
              <DeleteButton songId={song.id} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      ) : (
        <p className="no-songs-message"style={{color:"black",fontSize:"16px"}}>Inga sparade låtar hittades.</p>
      )}
    </div>
  );
};

export default SavedSongs;
