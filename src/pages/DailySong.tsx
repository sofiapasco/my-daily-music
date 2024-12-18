import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Track } from "../types/song"; 
import LikeButton from "../components/LikeButton";
import SpotifyPlayer from "../components/SpotifyPlayer";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ShareSong from "../components/ShareSong";
import { useSwipeable } from "react-swipeable";
import { moodAttributes } from "../components/MoodAttributes";
import UserMenu from '../components/UserMenu';
import "react-toastify/dist/ReactToastify.css";
import pLimit from "p-limit";

const DailySong: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Track | null>(null);
  const { accessToken, logout, userId } = useAuth();
  const [showSelect, setShowSelect] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]); 
  const [playlists, setPlaylists] = useState<{ name: string; songs: Track[] }[]>([]);
  const [excludedSongs, setExcludedSongs] = useState<string[]>([]);
  const [isThrowing, setIsThrowing] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const navigate = useNavigate();
  const duration = currentSong ? currentSong.duration_ms / 1000 : 0; 
  const artistGenreCache: Record<string, string[]> = {};
  const limit = pLimit(5);

  const updateLocalStorage = (key: string, value: any, userId: string, setState: React.Dispatch<any>) => {
    const storageKey = `${key}_${userId}`; 
    const existingData = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updatedData = Array.isArray(existingData) ? [...existingData, ...value] : value;
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    setState(updatedData);
  };  
  
  useEffect(() => {
    if (!currentSong) return;

    const interval = setInterval(() => {
      setCurrentSong((prevSong) => {
        if (!prevSong || !prevSong.duration_ms) return prevSong;
        const updatedSong = { ...prevSong };
        const currentTime = (updatedSong.currentTime || 0) + 1;
        if (currentTime >= duration) {
          clearInterval(interval);
          return updatedSong;
        }
        return { ...updatedSong, currentTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSong, duration]);


  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeDirection("swipe-left"); 
      handleExcludeSong(); 
      resetSwipe();
    },
    onSwipedRight: () => {
      setSwipeDirection("swipe-right"); 
      if (currentSong) {
        handleLike(currentSong); 
      }
      resetSwipe();
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });
  
  const resetSwipe = () => {
    setTimeout(() => setSwipeDirection(null), 500); 
  };
  

  useEffect(() => {
    if (!userId) return;
  
    const selectedMoodKey = `selectedMood_${userId}`;
    const storedMoodData = localStorage.getItem(selectedMoodKey);
  
    if (!storedMoodData) {
      navigate("/mood-selection");
    } else {
      const { mood, date } = JSON.parse(storedMoodData);
      const today = new Date().toISOString().split("T")[0];
      if (date !== today) {
        navigate("/mood-selection");
      } else {
        setSelectedMood(mood);
      }
    }
  }, [userId, navigate]);
  
  
  const filterTracksByMood = (tracks: Track[], mood: string): Track[] => {
    const moodMapping: Record<string, string> = {
      "😊": "happy",
      "😢": "low",
      "💪": "energetic",
      "😴": "low",
      "😌": "relaxed",
      "🥰": "love",
      "neutral": "neutral",
    };
  
    const mappedMood = mood.trim() === "neutral" ? "neutral" : moodMapping[mood.trim()] || "neutral";  
    const filters = moodAttributes[mappedMood];
    if (!filters) {
      return [];
    }
  
    return tracks.filter((track) => {
      const hasGenres = track.genres && track.genres.length > 0;
      
      const matchesGenre =
        hasGenres
          ? filters.genres?.some((genre) =>
              track.genres!.map((g) => g.toLowerCase()).includes(genre.toLowerCase())
            ) ?? false
          : true; 

      if (!matchesGenre && hasGenres) {
      }
  
      const popularityInRange =
        !filters.popularity ||
        (track.popularity >= filters.popularity[0] && track.popularity <= filters.popularity[1]);
  
      if (!popularityInRange) {
        console.log(`Utesluten p.g.a. popularitet: ${track.name}`);
      }
  
      const durationInRange =
        !filters.duration_ms ||
        (track.duration_ms >= filters.duration_ms[0] && track.duration_ms <= filters.duration_ms[1]);
  
      if (!durationInRange) {
        console.log(`Utesluten p.g.a. längd: ${track.name}`);
      }

      if (!hasGenres) {
        return popularityInRange && durationInRange;
      }

      return matchesGenre && popularityInRange && durationInRange;
    });
  };

  const enrichTrackWithGenres = async (track: Track, accessToken: string): Promise<Track> => {
    try {
      const artistId = track.artists[0]?.id;
      if (!artistId) {
        return { ...track, genres: [] }; 
      }
  
      if (artistGenreCache[artistId]) {
        return { ...track, genres: artistGenreCache[artistId] };
      }
  
      const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      if (!response.ok) {
        return { ...track, genres: [] }; 
      }
  
      const data = await response.json();
      artistGenreCache[artistId] = data.genres;
      return { ...track, genres: data.genres }; 
    } catch (error) {
      return { ...track, genres: [] };
    }
  };
  

const fetchDailySong = async (excludedSongs: string[], selectedMood: string) => {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const dailySongKey = `dailySong_${userId}_${dateKey}`;

  const storedDailySong = localStorage.getItem(dailySongKey);
  
  if (storedDailySong) {
    const cachedSong: Track = JSON.parse(storedDailySong);
    if (!excludedSongs.includes(cachedSong.id)) {
      setCurrentSong(cachedSong); // Använd cachad låt om den inte är exkluderad
      return;
    } else {
      console.log("Cachad låt är exkluderad, hämtar ny låt...");
    }
  }

  if (!accessToken) {
    console.error("Ingen access token tillgänglig.");
    return;
  }

  const moodMapping: Record<string, string> = {
    "😊": "happy",      
    "😢": "low",         
    "😌": "relaxed",    
    "😴": "low",         
    "💪": "energetic", 
    "🥰": "love",  
    "neutral": "neutral",      
  };
  
  const sanitizedMood = selectedMood.trim();
  
  if (!moodMapping[sanitizedMood]) {
    toast.error(`Humöret ${sanitizedMood} stöds inte.`);
    return;
  }
  
  const mappedMood = moodMapping[sanitizedMood];
  try {
    const [topTracks, recentlyPlayed] = await Promise.all([
      fetch("https://api.spotify.com/v1/me/top/tracks?limit=50", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then((res) => res.json()),
      fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then((res) => res.json()),
    ]);

    const combinedTracks = [
      ...topTracks.items.map((item: Track) => item),
      ...recentlyPlayed.items.map((item: { track: Track }) => item.track),
    ];

    const filters = moodAttributes[mappedMood];
    if (!filters) {
      return;
    }

    const tracksWithGenres = await Promise.all(
      combinedTracks.map((track) =>
        limit(() => enrichTrackWithGenres(track, accessToken))
      )
    );
    const tracksToFilter = tracksWithGenres.filter((track) => !excludedSongs.includes(track.id));

    const filteredTracks = filterTracksByMood(tracksToFilter, selectedMood);

    if (!filteredTracks.length) {
      toast.info("Inga låtar tillgängliga för det valda humöret.");
      return;
    }
    const randomSong = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
    localStorage.setItem(dailySongKey, JSON.stringify(randomSong));
    setCurrentSong(randomSong);
    console.log("Ny vald låt:", randomSong);
  } catch (error) {
    console.error("Ett fel uppstod vid hämtning av låtar:", error);
  }
};

useEffect(() => {
  if (!accessToken || !selectedMood) return;
  const storedExcludedSongs = JSON.parse(localStorage.getItem("excludedSongs") || "[]");
  fetchDailySong(storedExcludedSongs, selectedMood);
}, [accessToken, selectedMood]);


const handleExcludeSong = async () => {
  if (!userId) {
    toast.warn("Ingen användare inloggad. Kan inte exkludera låtar.");
    return;
  }

  if (currentSong && currentSong.id) {
    const excludedStorageKey = `excludedSongs_${userId}`;
    const storedExcludedSongs = JSON.parse(localStorage.getItem(excludedStorageKey) || "[]");

    if (storedExcludedSongs.includes(currentSong.id)) {
      toast.info("Låten är redan i exkluderade låtar.");
      return; // Avsluta här för att undvika ytterligare exekvering
    }

    // Lägg till låten i exkluderade listan
    const updatedExcludedSongs = [...storedExcludedSongs, currentSong.id];
    setExcludedSongs(updatedExcludedSongs);
    localStorage.setItem(excludedStorageKey, JSON.stringify(updatedExcludedSongs));
    toast.success("Låten har lagts till i exkluderade låtar!");

    // Sätt dagens låt till null för att indikera att en ny låt behövs
    setCurrentSong(null);
    console.log("Exkluderad låt:", currentSong);

    await fetchDailySong(updatedExcludedSongs, selectedMood || "neutral");
  } else {
    toast.warn("Ingen låt att exkludera.");
  }
};

useEffect(() => {
  if (!userId) return;

  const likedStorageKey = `likedSongs_${userId}`;
  const storedLikedSongs = localStorage.getItem(likedStorageKey);
  if (storedLikedSongs) {
    setLikedSongs(JSON.parse(storedLikedSongs));
  } else {
    setLikedSongs([]);
  }

  const excludedStorageKey = `excludedSongs_${userId}`;
  const storedExcludedSongs = localStorage.getItem(excludedStorageKey);
  if (storedExcludedSongs) {
    setExcludedSongs(JSON.parse(storedExcludedSongs));
  } else {
    setExcludedSongs([]);
  }
}, [userId]);

const handleLike = (song: Track) => {
  if (!userId) {
    toast.error("Ingen användare inloggad.");
    return;
  }

  const storageKey = `likedSongs_${userId}`;
  const storedLikedSongs = JSON.parse(localStorage.getItem(storageKey) || "[]");

  if (storedLikedSongs.find((likedSong: Track) => likedSong.id === song.id)) {
    toast.info("Låten är redan sparad i dina gillade låtar!");
    return;
  }

  const updatedLikedSongs = [...storedLikedSongs, { ...song, date: new Date().toISOString() }];
  localStorage.setItem(storageKey, JSON.stringify(updatedLikedSongs));
  setLikedSongs(updatedLikedSongs); // Uppdatera React-state
  toast.success("Låten har lagts till i dina gillade låtar!");

    const imageElement = currentSong
      ? document.getElementById(`album-art-${currentSong.id}`) as HTMLImageElement
      : null;
    const targetElement = document.getElementById("saved-songs-section"); 
  
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
    if (!userId) {
      toast.error("Ingen användare inloggad.");
      return;
    }
  
    const storageKey = `likedSongs_${userId}`;
    const storedLikedSongs = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updatedSongs = storedLikedSongs.filter((song: Track) => song.id !== songId);
  
    updateLocalStorage("likedSongs", updatedSongs, userId, setLikedSongs);
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
    // Kontrollera om spellistan finns
    if (playlistIndex < 0 || playlistIndex >= playlists.length) {
      console.error("Ogiltigt spellisteindex:", playlistIndex);
      return;
    }
  
    const selectedPlaylist = playlists[playlistIndex];
  
    // Kontrollera om låten redan finns i spellistan
    const isSongInPlaylist = selectedPlaylist.songs.some(
      (playlistSong) => playlistSong.id === song.id
    );
    if (isSongInPlaylist) {
      toast.info(`Låten "${song.name}" finns redan i spellistan "${selectedPlaylist.name}"!`);
      return;
    }

    const updatedSongs = [...selectedPlaylist.songs, song];
    const updatedPlaylist = { ...selectedPlaylist, songs: updatedSongs };
    const updatedPlaylists = playlists.map((playlist, index) =>
      index === playlistIndex ? updatedPlaylist : playlist
    );
    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    toast.success(`"${song.name}" har lagts till i spellistan "${selectedPlaylist.name}"!`);
  };
  
  useEffect(() => {
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
    setPlaylists(storedPlaylists);
  }, []);

  return (
    <>
    <div  {...handlers} className="daily-song-container" style={{height: "100vh"}}>
      <div className="header">
        <UserMenu />
        <button className="logout-btn" onClick={logout}>
          Logga ut
        </button>
      </div>
        <h1 className="daily-song-title">DAGENS LÅT</h1>
        {currentSong ? (
         <div className={`song-info ${swipeDirection}`}>
            <p className="song-name" >{currentSong.name}</p>
            <p className="song-artist" id="songartist"style={{ color: "#922692" }}>
              {currentSong.artists[0].name}
            </p>
            <p>Humör: <span>{selectedMood}</span></p>
            <div className="album-and-like">
            <button
                  onClick={handleExcludeSong}
                  className={`close-button ${isThrowing ? "throwing" : ""}`}
                  style={{ border: "none", background: "none" }}
                >
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
            {accessToken && (
              <SpotifyPlayer
                accessToken={accessToken}
                currentSong={currentSong}
                onReady={(deviceId) => console.log("Device ID är redo:", deviceId)}
              />
            )}
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
          <div className="loader-container">
            <span className="loader"></span>
          </div>
        )}
      </div>

      <div className="liked-songs-section">
        <h2 className="likedSong">Senaste sparade låtar:</h2>
        <div id="saved-songs-section" className="gallery-container">
        <div className="gallery-scroll">
        {likedSongs?.slice(-10).reverse().map((song,index) => (
            <div className="gallery-item" key={song.id || `${index}-${song.name}`}>
             <a href={song?.external_urls?.spotify || "#"} target="_blank" rel="noopener noreferrer">
              <img
                src={song?.album?.images?.[0]?.url || "/path/to/default-image.jpg"}
                alt={`${song?.name || "Okänd låt"} album art`}
                className="gallery-image"
                
              />
              </a>
            <div className="menu-container">
              <button
                className="menu-button"
                onClick={() => handleToggleMenu(song.id)}
              >
                &#x22EF;
              </button>
              {openMenuId === song.id && (
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
              <p className="song-name">{song?.name || "Okänd låt"}</p>
              <p className="song-artist">{song?.artists?.[0]?.name || "Okänd artist"}</p>
            </div>
          ))}
        </div>
        </div>
      </div>
    </>
  );
};

export default DailySong;