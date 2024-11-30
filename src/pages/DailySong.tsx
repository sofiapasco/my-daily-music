import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Track } from "../types/Song"; 
import LikeButton from "../components/LikeButton";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ShareSong from "../components/ShareSong";
import UserMenu from '../components/UserMenu';
import "react-toastify/dist/ReactToastify.css";

const DailySong: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Track | null>(null);
  const { accessToken, logout } = useAuth();
  const [savedSongs, setSavedSongs] = useState<Track[]>([]);
  const [showSelect, setShowSelect] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]); 
  const [playlists, setPlaylists] = useState<{ name: string; songs: Track[] }[]>([]);
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
      console.log("Valt humör från localStorage:", mood);
      setSelectedMood(mood); // Sätt det valda humöret
    }
  }, [navigate]);
  

  const fetchSongsByMood = async (mood: string, accessToken: string) => {
    const moodAttributes: Record<string, any> = {
      happy: { valence: [0.7, 1.0], energy: [0.6, 1.0] },
      sad: { valence: [0.0, 0.3], energy: [0.0, 0.4] },
      relaxed: { energy: [0.0, 0.5], acousticness: [0.5, 1.0] },
      energetic: { energy: [0.7, 1.0], tempo: [120, 180] },
    };
  
    const filters = moodAttributes[mood];
    if (!filters) {
      console.error("Okänt humör:", mood);
      return [];
    }
  
    const query = new URLSearchParams({
      target_valence: filters.valence ? `${(filters.valence[0] + filters.valence[1]) / 2}` : "",
      target_energy: filters.energy ? `${(filters.energy[0] + filters.energy[1]) / 2}` : "",
      target_tempo: filters.tempo ? `${(filters.tempo[0] + filters.tempo[1]) / 2}` : "",
      limit: "20",
      seed_genres: "pop", // Standardgenre
    });
  
    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?${query.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  
    const data = await response.json();
    return data.tracks;
  };
  

  const fetchDailySong = async (excluded: string[], mood: string | null) => {
    console.log("### fetchDailySong KÖRS ###");
    console.log("Exkluderade låtar:", excluded);
    console.log("Valt humör:", mood);
  
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
    // Kontrollera om dagens låt redan är sparad
    const storedDailySong = localStorage.getItem(`dailySong_${dateKey}`);
    if (storedDailySong) {
      console.log("Dagens låt laddad från localStorage:", JSON.parse(storedDailySong));
      setCurrentSong(JSON.parse(storedDailySong));
      return;
    }
  
    if (!accessToken) {
      console.error("Ingen access token tillgänglig.");
      return;
    }
  
    const uniqueExcluded = Array.from(new Set(excluded));
    console.log("Exkluderade låtar utan dubbletter:", uniqueExcluded);
  
    try {
      // Hämta låtar från top tracks och recently played
      const [topTracks, recentlyPlayed] = await Promise.all([
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
      ]);
  
      // Kombinera låtar från top tracks och recently played
      const combinedTracks = [
        ...topTracks.items.map((item: any) => item),
        ...recentlyPlayed.items.map((item: any) => item.track),
      ];
      console.log("Alla spår före filtrering:", combinedTracks.map((track) => track.id));
  
      // Filtrera bort exkluderade låtar
      const filteredTracks = combinedTracks.filter(
        (track) => track.id && !uniqueExcluded.includes(track.id.trim())
      );
  
      console.log("Låtar efter filtrering (från top/recent):", filteredTracks.map((track) => track.id));
  
      // Om humör är valt, hämta låtar baserat på humöret
      let moodTracks = [];
      if (mood) {
        moodTracks = await fetchSongsByMood(mood, accessToken);
        console.log("Låtar från fetchSongsByMood:", moodTracks.map((track: Track) => track.id));
      }
  
      // Kombinera låtar från humör och filtrerade låtar
      const allTracks = [...filteredTracks, ...moodTracks];
      console.log("Totalt antal låtar att välja från:", allTracks.length);
  
      if (allTracks.length === 0) {
        console.warn("Inga låtar kvar efter filtrering. Återställ exkluderingar.");
        setExcludedSongs([]);
        localStorage.removeItem("excludedSongs");
        return;
      }
  
      // Välj en slumpad låt
      const randomSong = allTracks[Math.floor(Math.random() * allTracks.length)];
      console.log("Ny slumpad låt:", randomSong);
  
      // Spara låten som dagens låt
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
  if (!accessToken || !selectedMood) return;
  const storedExcludedSongs = JSON.parse(localStorage.getItem("excludedSongs") || "[]");
  console.log("Anropar fetchDailySong med:", storedExcludedSongs, selectedMood);
  fetchDailySong(storedExcludedSongs, selectedMood);
}, [accessToken, selectedMood]);


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

  const handleLike = (song: Track, event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (likedSongs.find((likedSong) => likedSong.id === song.id)) {
      toast.info("Låten är redan sparad i dina gillade låtar!");
      return;
    }
  
    const updatedLikedSongs = [...likedSongs, song];
    setLikedSongs(updatedLikedSongs);
  
    // Uppdatera localStorage
    localStorage.setItem("likedSongs", JSON.stringify(updatedLikedSongs));
    toast.success("Låten har lagts till i dina gillade låtar!");
  
    // Flygeffekt för låtbilden
    const imageElement = currentSong
    ? document.getElementById(`album-art-${currentSong.id}`) as HTMLImageElement
    : null;
    console.log("Detta är låtbilden:", imageElement);
    const targetElement = document.getElementById("saved-songs-section"); // Målsektionen
  
    if (imageElement && targetElement) {
      const startRect = imageElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
  
      // Skapa en flygande kopia av bilden
      const animationElement = imageElement.cloneNode(true) as HTMLElement;
      animationElement.style.position = "absolute";
      animationElement.style.top = `${startRect.top}px`;
      animationElement.style.left = `${startRect.left}px`;
      animationElement.style.width = `${startRect.width}px`;
      animationElement.style.height = `${startRect.height}px`;
      animationElement.style.transition = "all 0.8s ease-in-out";
      animationElement.style.zIndex = "1000";
      document.body.appendChild(animationElement);
  
      // Flytta bilden mot målsektionen
      setTimeout(() => {
        animationElement.style.top = `${targetRect.top + 50}px`;
        animationElement.style.left = `${targetRect.left + 10}px`;
        animationElement.style.width = "50px";
        animationElement.style.height = "50px";
        animationElement.style.opacity = "0.5";
      }, 0);
  
      // Ta bort den animerade bilden efter animationen
      setTimeout(() => {
        document.body.removeChild(animationElement);
      }, 800);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("spotifyAccessToken");
    logout();
  };

  const handleToggleMenu = (menuId: string): void => {
    if (openMenuId === menuId) {
      // Om menyn redan är öppen, stäng den
      setOpenMenuId(null);
      if (timeoutId !== null) {
        clearTimeout(timeoutId); 
        setTimeoutId(null);
      }
    } else {
      setOpenMenuId(menuId);
      if (timeoutId !== null) clearTimeout(timeoutId);
      const id = window.setTimeout(() => {
        setOpenMenuId(null); 
      }, 5000); 
      setTimeoutId(id); 
    }
  };

  const handleRemoveFromSavedSongs = (songId: string) => {
    const updatedSongs = savedSongs.filter((song) => song.id !== songId);
    setSavedSongs(updatedSongs);

    localStorage.setItem("likedSongs", JSON.stringify(updatedSongs));
    toast.success("Låten har tagits bort!");
  };

  const handleShareSong = (song: Track) => {
    const shareText = `Lyssna på "${song.name}" av ${song.artists[0].name}: ${song.external_urls.spotify}`;
    if (navigator.share) {
      navigator
        .share({
          title: song.name,
          text: shareText,
          url: song.external_urls.spotify,
        })
        .catch((error) => console.error("Delning misslyckades:", error));
    } else {
      navigator.clipboard.writeText(shareText);
      console.log("Länk kopierad till urklipp!");
    }
  };

  const handleAddSongToPlaylist = (playlistIndex: number, song: Track) => {
    console.log(`Lägger till låt "${song.name}" i spellistan "${playlists[playlistIndex].name}"`);
    const selectedPlaylist = playlists[playlistIndex];
    const updatedSongs = [...selectedPlaylist.songs, song];
  
    const updatedPlaylist = { ...selectedPlaylist, songs: updatedSongs };
    const updatedPlaylists = playlists.map((playlist, index) =>
      index === playlistIndex ? updatedPlaylist : playlist
    );
  
    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    toast.success(`"${song.name}" har lagts till i spellistan "${selectedPlaylist.name}"`);
  };

  useEffect(() => {
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
    setPlaylists(storedPlaylists);
  }, []);

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
                  src="/close1.png" 
                  alt="Radera låt"
                  className="close"
                />
              </button>
              <div className="album-art-container">
              <a href={currentSong.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <img
                  id={`album-art-${currentSong.id}`}
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

      <div className="liked-songs-section">
        <h2 className="likedSong">Senaste sparade låtar:</h2>
        <div id="saved-songs-section" className="gallery-container">
        <div className="gallery-scroll">
        {likedSongs.slice(-10).reverse().map((song,index) => (
            <div className="gallery-item" key={song.id}>
              <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <img
                  src={song.album?.images?.[0]?.url || "/path/to/default-image.jpg"}
                  alt="Album art"
                  className="gallery-image"
                  onClick={(event) => handleLike(song, event)}
                />
              </a>
              <p className="song-name">{song.name}</p>
              <p className="song-artist">{song.artists[0].name}</p>
              <div className="menu-container">
                <button
                  className="menu-button"
                  onClick={() => handleToggleMenu(`${index}-${song.id}`)}
                >
                  &#x22EE;
                </button>
                {openMenuId === `${index}-${song.id}` && (
          <div className="menu-dropdown">
          <button onClick={() => handleShareSong(song)}>Dela låt</button>
          <button onClick={() => setShowSelect(!showSelect)}>Välj album:</button>
          {showSelect && (
            <select
            onChange={(e) => {
              const playlistIndex = parseInt(e.target.value, 10);
              if (!isNaN(playlistIndex)) {
                handleAddSongToPlaylist(playlistIndex, song);
                setShowSelect(false); 
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Välj spellista
            </option>
            {playlists.map((playlist, playlistIndex) => (
              <option key={playlistIndex} value={playlistIndex}>
                {playlist.name}
              </option>
            ))}
          </select>
          )}
          <button onClick={() => handleRemoveFromSavedSongs(song.id)}>Ta bort</button>
        </div>
            )}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </>
  );
};

export default DailySong;