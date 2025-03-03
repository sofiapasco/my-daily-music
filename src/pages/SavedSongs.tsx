import { useEffect, useState } from "react";
import { Track } from "../types/song";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { createPlaylistInFirestore,
  updateLikedSongsInFirestore,
  updatePlaylistsInFirestore,
  fetchLikedSongs,
  fetchAppPlaylists
} from "../service/firestoreService"; 
import { useLocation, useNavigate, Link } from "react-router-dom"; 
import UserMenu from "../components/UserMenu";
import "react-toastify/dist/ReactToastify.css";
import SearchBar from "../components/SearchSongs";
import Pagination from "../components/Pagination";

const SavedSongs: React.FC = () => {
  const [showSelect, setShowSelect] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [savedSongs, setSavedSongs] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<{ name: string; songs: Track[] }[]>([]);
  const [showModal, setShowModal] = useState(false); // Hanterar modalens synlighet
  const [newPlaylistName, setNewPlaylistName] = useState<string>("");
  const [filteredSongs, setFilteredSongs] = useState<Track[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { logout,userId } = useAuth();
  const itemsPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();

    useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pageFromUrl = queryParams.get("page");
    if (pageFromUrl) {
      setCurrentPage(parseInt(pageFromUrl, 10));
    }
  }, [location]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    localStorage.setItem("currentPage", page.toString());
    navigate(`?page=${page}`);
  };
 
  useEffect(() => {
    if (!userId) return; // Om användaren inte är inloggad, gör inget
  
    const fetchLikedSongsData = async () => {
      try {
        const likedSongs = await fetchLikedSongs(userId); // Hämta låtar från Firestore
        setSavedSongs(likedSongs); // Uppdatera React-state med hämtade låtar
      } catch (error) {
        console.error("Fel vid hämtning av gillade låtar från Firestore:", error);
      }
    };
  
    fetchLikedSongsData();
  }, [userId]);  

  useEffect(() => {
    if (!userId) return; // Säkerställ att användaren är inloggad
  
    const fetchPlaylistsData = async () => {
      try {
        const playlists = await fetchAppPlaylists(userId); 
        setPlaylists(playlists); 
      } catch (error) {
        console.error("Fel vid hämtning av spellistor från Firestore:", error);
      }
    };
  
    fetchPlaylistsData();
  }, [userId]);
  


  const handleSearch = () => {
    if (!searchQuery.trim()) {
     
      setFilteredSongs(savedSongs);
      return;
    }
  
    const filtered = savedSongs.filter(
      (song) =>
        song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artists[0]?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    setFilteredSongs(filtered);
    setCurrentPage(1);
  };
  
  useEffect(() => {
    handleSearch();
  }, [searchQuery, savedSongs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredSongs]);

  const handleRemoveFromSavedSongs = async (songId: string) => {
    if (!userId) {
      toast.error("Ingen användare inloggad.");
      return;
    }
  
    try {
      // Filtrera bort låten från React-state
      const updatedSongs = savedSongs.filter((song) => song.id !== songId);
      setSavedSongs(updatedSongs);
  
      // Uppdatera Firestore med de nya gillade låtarna
      await updateLikedSongsInFirestore(userId, updatedSongs);
  
      toast.success("Låten har tagits bort!");
    } catch (error) {
      console.error("Fel vid borttagning av låt från Firestore:", error);
      toast.error("Ett fel uppstod vid borttagning av låten.");
    }
  };
  
  const handleCreatePlaylist = async () => {
    if (!userId) {
      toast.error("Ingen användare inloggad.");
      return;
    }
  
    if (!newPlaylistName.trim()) {
      toast.error("Spellistans namn kan inte vara tomt!");
      return;
    }
  
    const newPlaylist = { name: newPlaylistName, songs: [] }; // Ny spellista
  
    try {
      const updatedPlaylists = await createPlaylistInFirestore(userId, newPlaylist);
      setPlaylists(updatedPlaylists); // Uppdatera React-state med de nya spellistorna
      toast.success(`Spellistan "${newPlaylistName}" har skapats!`);
      setNewPlaylistName("");
      setShowModal(false);
    } catch (error) {
      console.error("Fel vid skapandet av spellista:", error);
      toast.error("Ett fel uppstod vid skapandet av spellistan.");
    }
  };

  const handleAddSongToPlaylist = async (playlistIndex: number, song: Track) => {
    if (!userId) {
      toast.error("Ingen användare inloggad.");
      return;
    }
  
    const selectedPlaylist = playlists[playlistIndex];
  
    // Kontrollera att spellistan existerar
    if (!selectedPlaylist) {
      console.error("Spellistan hittades inte.");
      return;
    }
  
    // Kontrollera om låten redan finns i spellistan
    const isSongInPlaylist = selectedPlaylist.songs.some(
      (playlistSong) => playlistSong.id === song.id
    );
  
    if (isSongInPlaylist) {
      toast.info(`"${song.name}" finns redan i spellistan "${selectedPlaylist.name}"`);
      return;
    }
  
    // Uppdatera spellistan med den nya låten
    const updatedSongs = [...selectedPlaylist.songs, song];
    const updatedPlaylist = { ...selectedPlaylist, songs: updatedSongs };
    const updatedPlaylists = playlists.map((playlist, index) =>
      index === playlistIndex ? updatedPlaylist : playlist
    );
  
    // Uppdatera React-state
    setPlaylists(updatedPlaylists);
  
    try {
      // Uppdatera Firestore med de nya spellistorna
      await updatePlaylistsInFirestore(userId, updatedPlaylists);
  
      toast.success(`"${song.name}" har lagts till i spellistan "${selectedPlaylist.name}"`);
    } catch (error) {
      console.error("Fel vid uppdatering av spellista i Firestore:", error);
      toast.error("Ett fel uppstod vid uppdatering av spellistan.");
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
        .then(() => closeMenu())
        .catch((error) => {
          console.error("Delning misslyckades:", error);
          toast.error("Kunde inte dela låten.");
        });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Web Share API stöds inte. Länk kopierad till urklipp!");
    }
  };

  const handleDeletePlaylist = async (playlistIndex: number) => {
    if (!userId) {
      toast.error("Ingen användare inloggad.");
      return;
    }
  
    // Kontrollera att indexet är giltigt
    if (playlistIndex < 0 || playlistIndex >= playlists.length) {
      console.error("Ogiltigt spellisteindex:", playlistIndex);
      return;
    }
  
    try {
      // Skapa en ny lista utan den spellista som ska raderas
      const updatedPlaylists = playlists.filter((_, index) => index !== playlistIndex);
  
      // Uppdatera spellistor i Firestore
      await updatePlaylistsInFirestore(userId, updatedPlaylists);
  
      // Uppdatera React-state
      setPlaylists(updatedPlaylists);
  
      toast.success("Spellistan har tagits bort!");
    } catch (error) {
      console.error("Fel vid borttagning av spellista i Firestore:", error);
      toast.error("Ett fel uppstod vid borttagning av spellistan.");
    }
  };
  

  const handleRemoveFromPlaylist = async (playlistIndex: number, songId: string) => {
    if (!userId) {
      toast.error("Ingen användare inloggad.");
      return;
    }

    const selectedPlaylist = playlists[playlistIndex];
    if (!selectedPlaylist) {
      toast.error("Spellistan hittades inte.");
      return;
    }
  
    try {
      const updatedSongs = selectedPlaylist.songs.filter((song) => song.id !== songId);
      const updatedPlaylist = { ...selectedPlaylist, songs: updatedSongs };
  
      const updatedPlaylists = playlists.map((playlist, index) =>
        index === playlistIndex ? updatedPlaylist : playlist
      );
      await updatePlaylistsInFirestore(userId, updatedPlaylists);

      setPlaylists(updatedPlaylists);
      toast.success("Låten har tagits bort från spellistan!");
    } catch (error) {
      console.error("Fel vid borttagning av låt från spellista i Firestore:", error);
      toast.error("Ett fel uppstod vid borttagning av låten från spellistan.");
    }
  };
  
  const closeMenu = () => {
    setOpenMenuId(null); 
  };

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".menu-container")) {
      setOpenMenuId(null); 
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const handleToggleMenu = (menuId: string): void => {
  if (openMenuId === menuId) {
    setOpenMenuId(null);
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  } else {
    if (timeoutId !== null) clearTimeout(timeoutId);
    setOpenMenuId(menuId);
    const id = window.setTimeout(() => setOpenMenuId(null), 5000);
    setTimeoutId(id);
  }
};

const indexOfLastSong = currentPage * itemsPerPage;
const indexOfFirstSong = indexOfLastSong - itemsPerPage;

const songsToRender = searchQuery
  ? filteredSongs.slice(indexOfFirstSong, indexOfLastSong)
  : savedSongs.slice(indexOfFirstSong, indexOfLastSong);



  return (
  <div className="saved-songs-container" style={{height: "100%"}}>
      <div className="header">
        <UserMenu />
        <button className="logout-btn" onClick={logout}>
          Logga ut
        </button>
      </div>
      <div className="create-playlist-container">
        <button title="Skapa ny spellista" onClick={() => setShowModal(true)}>+</button>
      </div>
      <SearchBar
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSearch={handleSearch} />
        <h1>Alla sparade låtar:</h1>
      <div className="gallery-container">       
      {songsToRender.map((song, index) => (
  <div className="gallery-item" key={`${song.id}-${index}`}>
    <div className="image-container">
      <a
        href={song?.external_urls?.spotify || "#"}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={song?.album?.images?.[0]?.url || "/path/to/default-image.jpg"}
          alt={`${song?.name || "Okänd låt"} album art`}
          className="gallery-image"
        />
      </a>

      {/* Tre prickar för meny */}
      <div className="menu-container">
        <button
          className="menu-button"
          onClick={() => handleToggleMenu(`${song.id}-${index}`)}
        >
          &#x22EF;
        </button>
        {openMenuId === `${song.id}-${index}` && (
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

    <p className="song-name">{song.name}</p>
    <p className="song-artist">{song?.artists?.[0]?.name || "Okänd artist"}</p>
  </div>
))}

  </div>
  <Pagination
  totalItems={searchQuery ? filteredSongs.length : savedSongs.length}
  itemsPerPage={itemsPerPage}
  currentPage={currentPage}
  onPageChange={handlePageChange}
/>
  <div className="playlists-container">
  {playlists.length > 0 ? (
    playlists.map((playlist, index) => (
      <div key={index} className="playlist-item">
        <h2 style={{ fontSize: "18px", letterSpacing: "3px", paddingBottom: "5px", fontWeight: "bold" }}>
        <Link to={`/playlist/${playlist.name}`} style={{ textDecoration: "none", color: "inherit" }}>
          {playlist.name}
        </Link>
        </h2>
        <p style={{fontSize:"12px", letterSpacing:"1px"}}>{playlist.songs.length} låtar</p>
        <button 
          onClick={() => handleDeletePlaylist(index)} 
          className="delete-playlist-btn" 
          style={{
            background: "none",
            border: "none",
            padding: "0",
            cursor: "pointer"
          }}
        >
          <img 
            title="Radera "
            src="/recycle-bin.png" 
            alt="Radera spellista" 
            style={{
              width: "24px",
              height: "24px",
            }}
          />
        </button>
        {/* Visa låtar i spellistan */}
        <div className="gallery-container">
          {playlist.songs.slice(0, 7).map((song) => (
          <div className="gallery-item" style={{width: "200px",height: "300px"}} key={song.id}>
          <div className="image-container">
            <a
              href={song?.external_urls?.spotify || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={song?.album?.images?.[0]?.url || "/path/to/default-image.jpg"}
                alt={`${song?.name || "Okänd låt"} album art`}
                className="gallery-image"
              />
            </a>

            {/* Tre prickar för meny */}
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
                  <button onClick={() => handleRemoveFromPlaylist(index, song.id)}>Ta bort</button>
                </div>
              )}
            </div>
          </div>

          <p className="song-name" style={{fontSize: "11px"}}>{song.name}</p>
          <p className="song-artist"style={{fontSize: "10px"}}>{song?.artists?.[0]?.name || "Okänd artist"}</p>
        </div>

          ))}

        </div>
      </div>
    ))
  ) : (
    <p></p>
  )}
</div>
      {/* Modal för att skapa spellista */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Skapa en ny spellista</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreatePlaylist();
              }}
            >
              <input
                type="text"
                placeholder="Namnge din spellista"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <div className="modal-buttons">
                <button type="submit">Skapa</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSongs;
