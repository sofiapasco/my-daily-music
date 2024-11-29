import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Track } from "../types/Song"; 
import LikeButton from "../components/LikeButton";
import DeleteButton from "../components/DeleteButton";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ShareSong from "../components/ShareSong";
import UserMenu from '../components/UserMenu';
import "react-toastify/dist/ReactToastify.css";

const DailySong: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Track | null>(null);
  const { accessToken, logout } = useAuth();
  const [likedSongs, setLikedSongs] = useState<Track[]>([]); 
  const [userId, setUserId] = useState<string>("");
  const [excludedSongs, setExcludedSongs] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    const mood = localStorage.getItem("selectedMood");
    if (!mood) {
      console.log("Inget humör valt. Navigera till MoodSelection.");
      navigate("/mood-selection");
    } else {
      setSelectedMood(mood);
      console.log("Valt humör från localStorage:", mood);
    }
  }, [navigate]);
  

  const fetchDailySong = async (excluded: string[], mood: string | null) => {
    console.log("fetchDailySong körs med exkluderade låtar:", excluded);
    console.log("Valt humör:", mood);
  
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
    const storedDailySong = localStorage.getItem(`dailySong_${dateKey}`);
    if (storedDailySong) {
      console.log("Dagens låt laddad från localStorage:", JSON.parse(storedDailySong));
      setCurrentSong(JSON.parse(storedDailySong));
      return;
    }
  
    const uniqueExcluded = Array.from(new Set(excluded));
    console.log("Exkluderade låtar utan dubbletter:", uniqueExcluded);
  
    if (!accessToken) {
      console.error("Ingen access token tillgänglig.");
      return;
    }
  
    try {
      const [topTracks, recentlyPlayed /*, recommendations*/] = await Promise.all([
        // Anrop för Top Tracks
        fetch("https://api.spotify.com/v1/me/top/tracks?limit=50", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then(async (res) => {
            if (!res.ok) {
              console.error("Top Tracks API fel:", res.status, await res.text());
              throw new Error(`Top Tracks API error: ${res.status}`);
            }
            return res.json();
          }),
  
        // Anrop för Recently Played
        fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then(async (res) => {
            if (!res.ok) {
              console.error("Recently Played API fel:", res.status, await res.text());
              throw new Error(`Recently Played API error: ${res.status}`);
            }
            return res.json();
          }),
  
        /*
        // Detta anrop är bortkommenterat tillfälligt eftersom seed_tracks inte fungerar
        fetch(
          "https://api.spotify.com/v1/recommendations?limit=20&seed_tracks=06dqEjsPKmurrmu3WL4j9k",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
          .then(async (res) => {
            if (!res.ok) {
              console.error("Recommendations API fel:", res.status, await res.text());
              throw new Error(`Recommendations API error: ${res.status}`);
            }
            return res.json();
          }),
        */
      ]);
  
      // Kombinera spår från de olika anropen
      const combinedTracks = [
        ...topTracks.items.map((item: any) => item),
        ...recentlyPlayed.items.map((item: any) => item.track),
        // ...recommendations.tracks, // Bortkommenterad tills Recommendations fungerar
      ];
  
      console.log("Alla spår före filtrering:", combinedTracks.map((track) => track.id));
  
      // Filtrera exkluderade låtar
      const filteredTracks = combinedTracks.filter(
        (track) => track.id && !uniqueExcluded.includes(track.id.trim())
      );
  
      console.log("Låtar efter filtrering:", filteredTracks.map((track) => track.id));
  
      if (filteredTracks.length === 0) {
        console.warn("Alla låtar är exkluderade. Återställ exkluderade låtar för att fortsätta.");
        setExcludedSongs([]);
        localStorage.removeItem("excludedSongs");
        return;
      }
  
      const randomSong = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
      console.log("Ny slumpad låt:", randomSong);
      setCurrentSong(randomSong);
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
  fetchDailySong(storedExcludedSongs,selectedMood);
}, [accessToken]);

const handleExcludeSong = () => {
  console.log("Nuvarande låt:", currentSong);
  console.log("Exkluderade låtar före uppdatering:", excludedSongs); 

  if (currentSong) {
    if (!excludedSongs.includes(currentSong.id)) {
      // Uppdatera exkluderade låtar
      const updatedExcludedSongs = [...excludedSongs, currentSong.id];
      console.log("Uppdaterad lista över exkluderade låtar:", updatedExcludedSongs);

      setExcludedSongs(updatedExcludedSongs);
      localStorage.setItem("excludedSongs", JSON.stringify(updatedExcludedSongs));

      // Rensa dagens låt och hämta en ny
      setCurrentSong(null);
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      localStorage.removeItem(`dailySong_${dateKey}`); 

      // Hämta ny låt
      fetchDailySong(updatedExcludedSongs, selectedMood);
    } else {
      console.log("Låten är redan exkluderad:", currentSong.id);
    }
  } else {
    console.warn("Ingen låt att exkludera.");
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
        <UserMenu />
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
            <button onClick={handleExcludeSong} style={{ border: "none", background: "none" }}>
                <img 
                  src="/close.png" 
                  alt="Radera låt"
                  className="close"
                />
              </button>
              <div className="album-art-container">
              <a href={currentSong.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <img
                  src={currentSong.album?.images?.[0]?.url || "/path/to/default-image.jpg"}
                  alt="Album art"
                  className="album-art"
                />
              </a>
              </div>
              <LikeButton song={currentSong} onLike={handleLike} />
            </div>
            {/*<SpotifyPlayer accessToken={accessToken} currentSong={currentSong} />*/}
            <div className="share-section">
            <ShareSong
              song={{
                title: currentSong.name,
                artist: currentSong.artists[0].name,
                link: currentSong.external_urls.spotify,
              }}
            />
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