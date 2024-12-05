import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Track } from "../types/Song"; 
import LikeButton from "../components/LikeButton";
import SpotifyPlayer from "../components/SpotifyPlayer";
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
  const [isThrowing, setIsThrowing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const navigate = useNavigate();

  const duration = currentSong ? currentSong.duration_ms / 1000 : 0; 

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
    const mood = localStorage.getItem("selectedMood");
  
    if (!mood) {
      console.log("Inget humör valt. Navigera till MoodSelection.");
      navigate("/mood-selection");
    } else {
      console.log("Valt humör från localStorage:", mood);
      setSelectedMood(mood); // Sätt det valda humöret
    }
  }, [navigate]);

  const fetchAudioFeatures = async (trackIds: string[], accessToken: string): Promise<any[]> => {
    if (!trackIds.length) {
      console.error("Inga låt-ID:n angivna.");
      return [];
    }
  
    try {
      const ids = trackIds.join(",");
      const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Fel vid hämtning av audio features:", errorDetails);
        return [];
      }
  
      const data = await response.json();
      console.log("Audio Features:", data.audio_features);
      return data.audio_features.filter((feature: any) => feature); // Filtrera bort null-värden
    } catch (error) {
      console.error("Ett fel uppstod vid API-anropet:", error);
      return [];
    }
  };
  
  const attachAudioFeaturesToTracks = (tracks: any[], audioFeatures: any[]) => {
    return tracks.map((track) => {
      const features = audioFeatures.find((feature) => feature && feature.id === track.id);
      return { ...track, ...features }; // Koppla audio features till låten
    });
  };
  
  const fetchDailySong = async (excludedSongs: string[], selectedMood: string) => {
    console.log("Exkluderade låtar:", excludedSongs);
  
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
  
    // Emoji till humör-mappning
    const moodMapping: Record<string, string> = {
      "😊": "happy",
      "😢": "low",
      "💪": "energetic",
      "😌": "relaxed",
      "😴": "low",
      "🥰": "love",
    };
  
    const mappedMood = moodMapping[selectedMood] || "neutral"; // Standard till "neutral"
    console.log("Valt humör:", selectedMood, "Mappat humör:", mappedMood);
  
    const moodAttributes: Record<string, any> = {
      happy: { valence: [0.5, 1.0], energy: [0.3, 1.0] },
      low: { valence: [0.0, 0.6], energy: [0.0, 0.7] },
      energetic: { valence: [0.3, 1.0], energy: [0.5, 1.0] },
      relaxed: { valence: [0.2, 0.9], energy: [0.1, 0.7], acousticness: [0.3, 1.0] },
      love: { valence: [0.5, 1.0], energy: [0.2, 0.6], acousticness: [0.3, 1.0] },
    };
    
    // Kontrollera om humöret finns i mappningen
    const filters = moodAttributes[mappedMood];
    if (!filters) {
      console.error("Okänt humör:", mappedMood);
      return; 
    }
  
    try {
      // Hämta låtar från Top Tracks och Recently Played
      const [topTracks, recentlyPlayed] = await Promise.all([
        fetch("https://api.spotify.com/v1/me/top/tracks?limit=50", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then(async (res) => {
          if (!res.ok) throw new Error(`Top Tracks API error: ${res.status}`);
          return res.json();
        }),
  
        fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then(async (res) => {
          if (!res.ok) throw new Error(`Recently Played API error: ${res.status}`);
          return res.json();
        }),
      ]);
  
      // Kombinera låtar och filtrera bort exkluderade
      const combinedTracks = [
        ...topTracks.items.map((item: any) => item),
        ...recentlyPlayed.items.map((item: any) => item.track),
      ];

      console.log("Hämtade låtar:", combinedTracks);

      const trackIds = combinedTracks.map((track: any) => track.id);

      const audioFeatures = await fetchAudioFeatures(trackIds, accessToken);
      const tracksWithFeatures = attachAudioFeaturesToTracks(combinedTracks, audioFeatures);
  
      const tracksWithDefaultValues = tracksWithFeatures.map((track) => {
        if (!track.valence || !track.energy) {
          console.warn(`Sätter standardvärden för låt: ${track.name}`);
          return {
            ...track,
            valence: 0.5, // Neutralt standardvärde
            energy: 0.5,  // Neutralt standardvärde
          };
        }
        return track;
      });      

      console.log("Alla låtar innan filtrering:");
      combinedTracks.forEach((track: any) => {
        console.log(
          `Låt: ${track.name}, Popularitet: ${track.popularity}, Längd (ms): ${track.duration_ms}`
        );
      });

      console.log("Alla låtar innan filtrering:", tracksWithFeatures);

      const filteredTracks = tracksWithDefaultValues.filter((track: any) => {
        const logDetails = [];
        if (filters.valence && (track.valence < filters.valence[0] || track.valence > filters.valence[1])) {
          logDetails.push(`Valence utanför gränserna: ${track.valence}`);
        }
        if (filters.energy && (track.energy < filters.energy[0] || track.energy > filters.energy[1])) {
          logDetails.push(`Energy utanför gränserna: ${track.energy}`);
        }
        if (logDetails.length > 0) {
          console.log(`Utesluten: ${track.name} (${logDetails.join(", ")})`);
          return false;
        }
        return true;
      });      
      
      console.log("Filtrerade låtar:", filteredTracks);

    if (filteredTracks.length === 0) {
      toast.info("Inga fler låtar tillgängliga för det valda humöret. Exkluderingar har återställts.");
      setExcludedSongs([]);
      localStorage.removeItem("excludedSongs");
      return;
    }

      // Välj en slumpmässig låt
      const randomSong = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
      console.log("Slumpad låt:", randomSong);

      // Spara och uppdatera dagens låt
      localStorage.setItem(`dailySong_${dateKey}`, JSON.stringify(randomSong));
      setCurrentSong(randomSong);
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
  
  if (!selectedMood) {
    console.warn("Inget humör valt. Kan inte hämta en ny låt.");
    return;
  }

  if (currentSong) {
    if (!excludedSongs.includes(currentSong.id)) {
      setIsThrowing(true); // Starta kastanimationen
      
      setTimeout(() => {
        const updatedExcludedSongs = [...excludedSongs, currentSong.id];
        console.log("Uppdaterad lista över exkluderade låtar:", updatedExcludedSongs);

        // Uppdatera state och localStorage
        setExcludedSongs(updatedExcludedSongs);
        localStorage.setItem("excludedSongs", JSON.stringify(updatedExcludedSongs));

        // Ta bort dagens låt från localStorage
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        localStorage.removeItem(`dailySong_${dateKey}`);

        // Hämta en ny låt
        fetchDailySong(updatedExcludedSongs, selectedMood);

        setIsThrowing(false); // Återställ kastanimationen
      }, 1000); // Vänta tills animationen är klar (1 sekund)
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

    const updatedLikedSongs = [...likedSongs, { ...song, date: new Date().toISOString() }];
    updateLocalStorage("likedSongs", updatedLikedSongs, setLikedSongs);
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
  const updateLocalStorage = (key: string, value: any, setState: React.Dispatch<any>) => {
    localStorage.setItem(key, JSON.stringify(value));
    setState(value);
  };

  const handleRemoveFromSavedSongs = (songId: string) => {
    const updatedSongs = savedSongs.filter((song) => song.id !== songId);
    updateLocalStorage("likedSongs", updatedSongs, setSavedSongs);
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
  const categorizeSongMood = (song: Track, selectedMood: string): string => {
    const moodMapping: Record<string, string> = {
      "😊": "happy",    // Glad
      "😢": "low",      // Ledsen
      "💪": "energetic",// Energi
      "😌": "relaxed",  // Avslappnad
      "😴": "low",      // Sömnig
      "🥰": "love",     // Kärleksfull
    };
  
    const mappedMood = moodMapping[selectedMood] || "neutral";
    const valence = song.valence || 0; 
    const energy = song.energy || 0; 
    const acousticness = song.acousticness || 0; // För "relaxed" och "love"
  
    console.log("Analyserar låtens humör:", { song, selectedMood, mappedMood, valence, energy, acousticness });
  
    switch (mappedMood) {
      case "happy":
        if (valence >= 0.5 && energy >= 0.3) return "😊"; // Glad låt
        break;
  
      case "low":
        if (valence <= 0.3 && energy <= 0.4) return "😢"; // Ledsen låt
        if (valence <= 0.2 && energy <= 0.3) return "😴"; // Sömnig låt
        break;
  
      case "energetic":
        if (valence >= 0.3 && energy >= 0.5) return "💪"; // Energiladdad låt
        break;
  
      case "relaxed":
        if (valence >= 0.2 && valence <= 0.9 && energy <= 0.7 && acousticness >= 0.3) return "😌"; // Avslappnad låt
        break;
  
      case "love":
        if (valence >= 0.5 && energy <= 0.6 && acousticness >= 0.3) return "🥰"; // Kärleksfull låt
        break;
  
      default:
        break;
    }
  
    // Fallback-logik om låten inte matchar `selectedMood`
    if (valence >= 0.8 && energy <= 0.5) return "🥰"; // Kärleksfull fallback
    if (valence >= 0.7 && energy >= 0.6) return "😊"; // Glad fallback
    if (valence <= 0.3 && energy <= 0.4) return "😢"; // Ledsen fallback
    if (energy >= 0.8) return "💪"; // Energiladdad fallback
    if (valence >= 0.3 && valence <= 0.7 && energy <= 0.6) return "😌"; // Avslappnad fallback
  
    // Om inget passar, returnera neutral kategori
    return "🤔";
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
            <p className="song-mood">
              Humör: {categorizeSongMood(currentSong, selectedMood || "")}
            </p>
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
            {accessToken ? (
              <SpotifyPlayer accessToken={accessToken} currentSong={currentSong} />
            ) : (
              <p>Inloggning krävs för att spela musik.</p>
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
          <span className="loader"></span>
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
                onClick={(event) => handleLike(song, event)}
              />
              </a>
              <p className="song-name">{song?.name || "Okänd låt"}</p>
              <p className="song-artist">{song?.artists?.[0]?.name || "Okänd artist"}</p>
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