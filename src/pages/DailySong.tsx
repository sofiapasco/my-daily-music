import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Track } from "../types/song"; 
import LikeButton from "../components/LikeButton";
import SpotifyPlayer from "../components/SpotifyPlayer";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ShareSong from "../components/ShareSong";
import { saveToFirestore, 
          fetchLikedSongs, 
          fetchExcludedSongs, 
          fetchAppPlaylists,
          fetchMoodFromFirestore,
          updateLikedSongsInFirestore
         } from "../service/firestoreService";
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
  const [isThrowing] = useState(false);
  const [showSwipeInstructions, setShowSwipeInstructions] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const navigate = useNavigate();
  const duration = currentSong ? currentSong.duration_ms / 1000 : 0; 
  const artistGenreCache: Record<string, string[]> = {};
  const limit = pLimit(5);

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

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
  
    if (isMobile) {
      setShowSwipeInstructions(true);
  
      const timer = setTimeout(() => {
        setShowSwipeInstructions(false);
      }, 5000);
  
      return () => clearTimeout(timer);
    }
  }, []);
  
  useEffect(() => {
    const handleUserInteraction = () => {
      setShowSwipeInstructions(false);
    };
  
    window.addEventListener('click', handleUserInteraction);
  
    return () => {
      window.removeEventListener('click', handleUserInteraction);
    };
  }, []);

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
  
    const getMoodFromFirestore = async () => {
      try {
        const moodData = await fetchMoodFromFirestore(userId); 
        if (!moodData) {
          navigate("/mood-selection"); 
          return;
        }
  
        const { mood, date } = moodData;
        const today = new Date().toISOString().split("T")[0];
  
        if (date !== today) {
          navigate("/mood-selection"); 
        } else {
          setSelectedMood(mood); 
        }
      } catch (error) {
        console.error("Fel vid hämtning av humördata:", error);
        navigate("/mood-selection"); 
      }
    };
  
    getMoodFromFirestore();
  }, [userId, navigate]);
  
  
  const filterTracksByMood = (tracks: Track[], mood: string, isFallback = false): Track[] => {
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
  
    const filteredTracks = tracks.filter((track) => {
      const hasGenres = track.genres && track.genres.length > 0;
      
      const matchesGenre =
        hasGenres
          ? filters.genres?.some((genre) =>
              track.genres!.map((g) => g.toLowerCase()).includes(genre.toLowerCase())
            ) ?? false
          : true;
  
      const popularityInRange =
        !filters.popularity ||
        (track.popularity >= filters.popularity[0] && track.popularity <= filters.popularity[1]);
  
      const durationInRange =
        !filters.duration_ms ||
        (track.duration_ms >= filters.duration_ms[0] && track.duration_ms <= filters.duration_ms[1]);
  
      if (!hasGenres) {
        return popularityInRange && durationInRange;
      }
  
      return matchesGenre && popularityInRange && durationInRange;
    });
  
    if (filteredTracks.length === 0) {
      if (isFallback) {
        console.log("Ingen låt matchar, returnerar hela listan som sista utväg.");
        return tracks; 
      }
  
      console.log("Inga låtar för det valda humöret, fallback till neutral...");
      return filterTracksByMood(tracks, "neutral", true); 
    }
  
    return filteredTracks;
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
  const collectionPath = `users/${userId}/data`;
  const documentId = "dailySong";

  const storedDailySong = localStorage.getItem(dailySongKey);
  
  if (storedDailySong) {
    const cachedSong: Track = JSON.parse(storedDailySong);
    if (!excludedSongs.includes(cachedSong.id)) {
      setCurrentSong(cachedSong); 
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
      console.error("Inga låtar matchar humöret");
      toast.info("Inga låtar tillgängliga för det valda humöret.");
      await fetchDailySong(excludedSongs, "neutral"); 
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
    const shuffledTracks = filteredTracks.sort(() => Math.random() - 0.5);

    const randomSong = shuffledTracks.find((track) => !excludedSongs.includes(track.id));

    if (randomSong) {
      // Spara dagens låt i Firebase
      await saveToFirestore(collectionPath, documentId, {
        song: randomSong,
        date: today,
      });
      setCurrentSong(randomSong);
      toast.success("Dagens låt har hämtats och sparats!");
    } else {
      console.error("Ingen giltig låt hittades efter blandning och filtrering.");
    }
  } catch (error) {
    console.error("Ett fel uppstod vid hämtning av låtar:", error);
  }
};

useEffect(() => {
  if (!accessToken || !selectedMood || !userId) return; 
  const fetchExcludedSongsFromFirebase = async () => {
    try {
      const excludedSongsFromFirestore = await fetchExcludedSongs(userId); 
      fetchDailySong(excludedSongsFromFirestore, selectedMood); 
    } catch (error) {
      console.error("Fel vid hämtning av exkluderade låtar från Firebase:", error);
    }
  };
  fetchExcludedSongsFromFirebase();
}, [accessToken, selectedMood, excludedSongs, userId]);


const handleExcludeSong = async () => {
  if (!userId) {
    toast.warn("Ingen användare inloggad. Kan inte exkludera låtar.");
    return;
  }

  if (currentSong && currentSong.id) {
    const collectionPath = `users/${userId}/data`;
    const documentId = "excludedSongs";

    if (excludedSongs.includes(currentSong.id)) {
      await fetchDailySong(excludedSongs, selectedMood || "neutral");
      return;
    }

    const updatedExcludedSongs = [...excludedSongs, currentSong.id];
    setExcludedSongs(updatedExcludedSongs);

    try {
      await saveToFirestore(collectionPath, documentId, { songs: updatedExcludedSongs });
      toast.success("Låten har lagts till i exkluderade låtar!");
    } catch (error) {
      console.error("Fel vid sparning av exkluderade låtar:", error);
      toast.error("Kunde inte spara exkluderade låtar i Firestore.");
    }

    setCurrentSong(null);
    await fetchDailySong(updatedExcludedSongs, selectedMood || "neutral");
  } else {
    toast.warn("Ingen låt att exkludera.");
  }
};

useEffect(() => {
  if (!userId) return;

  const fetchData = async () => {
    try {
      const likedSongs = await fetchLikedSongs(userId);
      setLikedSongs(likedSongs);
      const excludedSongs = await fetchExcludedSongs(userId);
      setExcludedSongs(excludedSongs);
    } catch (error) {
      console.error("Fel vid hämtning av data från Firebase:", error);
    }
  };

  fetchData();
}, [userId]);

const handleLike = async (song: Track) => {
  if (!userId) {
    toast.error("Ingen användare inloggad.");
    return;
  }

  const collectionPath = `users/${userId}/data`;
  const documentId = "likedSongs";

  const storedLikedSongs = likedSongs || []; // React-state
  const isAlreadyLiked = storedLikedSongs.find((likedSong) => likedSong.id === song.id);

  if (isAlreadyLiked) {
    toast.info("Låten är redan sparad i dina gillade låtar!");
    return;
  }

  const updatedLikedSongs = [...storedLikedSongs, { ...song, date: new Date().toISOString() }];
  setLikedSongs(updatedLikedSongs); // Uppdatera React-state

  await saveToFirestore(collectionPath, documentId, { songs: updatedLikedSongs });
  toast.success("Låten har lagts till i dina gillade låtar!");

    const imageElement = currentSong
      ? document.getElementById(`album-art-${currentSong.id}`) as HTMLImageElement
      : null;
    const targetElement = document.getElementById("saved-songs-section"); 
  
    if (imageElement && targetElement) {
      const startRect = imageElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
  
      const animationElement = imageElement.cloneNode(true) as HTMLElement;
      animationElement.style.position = "absolute";
      animationElement.style.top = `${startRect.top}px`;
      animationElement.style.left = `${startRect.left}px`;
      animationElement.style.width = `${startRect.width}px`;
      animationElement.style.height = `${startRect.height}px`;
      animationElement.style.transition = "all 0.8s ease-in-out";
      animationElement.style.zIndex = "1000";
      document.body.appendChild(animationElement);
  
      setTimeout(() => {
        animationElement.style.top = `${targetRect.top + 50}px`;
        animationElement.style.left = `${targetRect.left + 10}px`;
        animationElement.style.width = "50px";
        animationElement.style.height = "50px";
        animationElement.style.opacity = "0.5";
      }, 0);
  
      setTimeout(() => {
        document.body.removeChild(animationElement);
      }, 800);
    }
  };  
  
  const handleToggleMenu = (menuId: string): void => {
    if (openMenuId === menuId) {
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
  
  const handleRemoveFromSavedSongs = async (songId: string) => {
    if (!userId) {
      toast.error("Ingen användare inloggad.");
      return;
    }
  
    try {
      const updatedSongs = likedSongs.filter((song: Track) => song.id !== songId);
      await updateLikedSongsInFirestore(userId, updatedSongs);
      setLikedSongs(updatedSongs);
  
      toast.success("Låten har tagits bort!");
    } catch (error) {
      console.error("Fel vid borttagning av låten från Firestore:", error);
      toast.error("Ett fel uppstod vid borttagning av låten.");
    }
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

  const handleAddSongToPlaylist = async (playlistIndex: number, song: Track) => {
    if (!userId) {
      toast.error("Ingen användare inloggad.");
      return;
    }
  
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
  
    const collectionPath = `users/${userId}/data`;
    const documentId = "playlists";
    try {
      await saveToFirestore(collectionPath, documentId, { playlists: updatedPlaylists });
      toast.success(`"${song.name}" har lagts till i spellistan "${selectedPlaylist.name}"!`);
    } catch (error) {
      toast.error("Ett fel uppstod vid sparning av spellistan.");
    }
  }; 

  useEffect(() => {
    if (!userId) return;
  
    const getAppPlaylists = async () => {
      const appPlaylistsFromFirestore = await fetchAppPlaylists(userId);
      setPlaylists(appPlaylistsFromFirestore); // Uppdatera React-state med användarens app-spellistor
    };
  
    getAppPlaylists();
  }, [userId]);  
  
  useEffect(() => {
    if (!userId) return;
  
    const getLikedSongs = async () => {
      const likedSongsFromFirestore = await fetchLikedSongs(userId);
      setLikedSongs(likedSongsFromFirestore); 
    };
  
    getLikedSongs();
  }, [userId]); 

  useEffect(() => {
    if (!userId) return;
  
    const getExcludedSongs = async () => {
      const excludedSongsFromFirestore = await fetchExcludedSongs(userId);
      setExcludedSongs(excludedSongsFromFirestore); 
    };
  
    getExcludedSongs();
  }, [userId]);
  

  return (
    <>
    <div  {...handlers} className="daily-song-container" style={{height: "100vh",paddingTop: "3rem"}}>
    {showSwipeInstructions && (
      <div className="swipe-instructions">
         <p>
        <span className="animate-text">👉 Svep höger för att gilla , </span><br></br>
        <span className="animate-text">👈 vänster för att ta bort.</span>
      </p>
      </div>
    )}
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
        <h2 className="likedSong" style={{paddingTop: "3rem"}}>Senaste sparade låtar:</h2>
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