import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Track } from "../types/Song"; // Importera Track-typen
import LikeButton from "../components/LikeButton";
import DeleteButton from "../components/DeleteButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DailySong: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Track | null>(null);
  const { accessToken, logout } = useAuth();
  const [likedSongs, setLikedSongs] = useState<Track[]>([]); 
  const [userId, setUserId] = useState<string>("");
  const [excludedSongs, setExcludedSongs] = useState<string[]>([]);

  const fetchDailySong = async (excluded: string[]) => {
    console.log("fetchDailySong körs med exkluderade låtar:", excluded);
  
    // Rensa dubbletter från exkluderingslistan
    const uniqueExcluded = Array.from(new Set(excluded)); // Rensa dubbletter
    console.log("Exkluderade låtar utan dubbletter:", uniqueExcluded);
  
    if (!accessToken) {
      console.error("Ingen access token tillgänglig.");
      return;
    }
  
    try {
      const [topTracks, recentlyPlayed, recommendations] = await Promise.all([
        fetch("https://api.spotify.com/v1/me/top/tracks?limit=50", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then((res) => res.json()),
        fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then((res) => res.json()),
        fetch(
          "https://api.spotify.com/v1/recommendations?limit=20&seed_tracks=4uLU6hMCjMI75M1A2tKUQC",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ).then((res) => res.json()),
      ]);
  
      // Kombinera alla spår
      const combinedTracks = [
        ...topTracks.items.map((item: any) => item),
        ...recentlyPlayed.items.map((item: any) => item.track),
        ...recommendations.tracks,
      ];
      console.log("Alla spår före filtrering:", combinedTracks);
  
      // Filtrera bort exkluderade låtar
      const filteredTracks = combinedTracks.filter((track: any) => !uniqueExcluded.includes(track.id));
      console.log("Spår efter filtrering:", filteredTracks);
  
      if (filteredTracks.length === 0) {
        console.warn("Alla låtar är exkluderade. Återställ exkluderade låtar för att fortsätta.");
        return;
      }
  
      // Välj en slumpmässig låt från filtrerade spår
      const randomSong = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
      console.log("Ny slumpad låt:", randomSong);
  
      setCurrentSong(randomSong);
  
      // Spara dagens låt
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      localStorage.setItem(`dailySong_${dateKey}`, JSON.stringify(randomSong));
    } catch (error) {
      console.error("Ett fel uppstod vid hämtning av låtar:", error);
    }
  };
  

useEffect(() => {
  const fetchUserId = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      setUserId(data.id);
    } catch (error) {
      console.error("Kunde inte hämta användarens ID:", error);
    }
  };

  fetchUserId();
}, [accessToken]);

useEffect(() => {
  const storedExcludedSongs = JSON.parse(localStorage.getItem("excludedSongs") || "[]");
  setExcludedSongs(storedExcludedSongs);
  fetchDailySong(storedExcludedSongs);
}, [accessToken]);

const handleExcludeSong = () => {
  console.log("Nuvarande låt:", currentSong); // Kontrollera låten
  console.log("Exkluderade låtar före uppdatering:", excludedSongs); // Kontrollera listan

  if (currentSong) {
    // Kontrollera om låten redan finns i exkluderingslistan
    if (!excludedSongs.includes(currentSong.id)) {
      const updatedExcludedSongs = [...excludedSongs, currentSong.id];
      console.log("Uppdaterad lista över exkluderade låtar:", updatedExcludedSongs);

      setExcludedSongs(updatedExcludedSongs);
      localStorage.setItem("excludedSongs", JSON.stringify(updatedExcludedSongs));

      setCurrentSong(null); // Töm nuvarande låt innan vi hämtar en ny
      fetchDailySong(updatedExcludedSongs);
    } else {
      console.log("Låten är redan exkluderad:", currentSong.id);
    }
  }
};

  useEffect(() => {
    if (!userId) return;

    const storedLikedSongs = localStorage.getItem("likedSongs");
    if (storedLikedSongs) {
      setLikedSongs(JSON.parse(storedLikedSongs));
    }
  }, [userId]);

  const handleLike = (song: Track) => {
    if (likedSongs.find((likedSong) => likedSong.id === song.id)) {
      toast.info("Låten är redan sparad i dina gillade låtar!");
      return;
    }

    const updatedLikedSongs = [...likedSongs, song];
    setLikedSongs(updatedLikedSongs);
    localStorage.setItem("likedSongs", JSON.stringify(updatedLikedSongs));
    toast.success("Låten har lagts till i dina gillade låtar!");
  };

  const handleDelete = (songId: string) => {
    const updatedLikedSongs = likedSongs.filter((song) => song.id !== songId);
    setLikedSongs(updatedLikedSongs);
    localStorage.setItem("likedSongs", JSON.stringify(updatedLikedSongs));
    toast.error("Låten har tagits bort från dina gillade låtar!");
  };

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
            <p className="song-artist" style={{ color: "#922692" }}>
              {currentSong.artists[0].name}
            </p>
            <div className="album-and-like">
            <button onClick={handleExcludeSong}>Radera låt</button>
              <a href={currentSong.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <img
                  src={currentSong.album?.images?.[0]?.url || "/path/to/default-image.jpg"}
                  alt="Album art"
                  className="album-art"
                />
              </a>
              <LikeButton song={currentSong} onLike={handleLike} />
            </div>
          </div>
        ) : (
          <span className="loader"></span>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />

      <div className="liked-songs-section">
        <h2 className="likedSong">Sparade låtar:</h2>
        <div className="gallery-container">
        <div className="gallery-scroll">
          {likedSongs.slice(0,10).map((song) => (
            <div className="gallery-item" key={song.id}>
              <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <img
                  src={song.album?.images?.[0]?.url || "/path/to/default-image.jpg"}
                  alt="Album art"
                  className="gallery-image"
                />
              </a>
              <p className="song-name">{song.name}</p>
              <p className="song-artist">{song.artists[0].name}</p>
              <DeleteButton songId={song.id} onDelete={handleDelete} />
            </div>
          ))}
        </div>
        </div>
      </div>
    </>
  );
};

export default DailySong;
