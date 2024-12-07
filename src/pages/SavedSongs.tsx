import { useEffect, useState } from "react";
import { Track } from "../types/Song";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useLocation, useNavigate, Link } from "react-router-dom"; 
import UserMenu from "../components/UserMenu";
import "react-toastify/dist/ReactToastify.css";
import SearchBar from "../components/SearchSongs";
import Pagination from "../components/Pagination";

const SavedSongs: React.FC = () => {
  const [visibleMenu, setVisibleMenu] = useState<number | null>(null);
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

  const { logout } = useAuth();
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
    const storedLikedSongs = localStorage.getItem("likedSongs");
    if (storedLikedSongs) {
      setSavedSongs(JSON.parse(storedLikedSongs));
    }

    const storedPlaylists = localStorage.getItem("playlists");
    if (storedPlaylists) {
      setPlaylists(JSON.parse(storedPlaylists)); 
    }
  }, []);

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

  const handleRemoveFromSavedSongs = (songId: string) => {
    const updatedSongs = savedSongs.filter((song) => song.id !== songId);
    setSavedSongs(updatedSongs);
    localStorage.setItem("likedSongs", JSON.stringify(updatedSongs));
    toast.success("Låten har tagits bort!");
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast.error("Spellistans namn kan inte vara tomt!");
      return;
    }

    const storedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
    const newPlaylist = { name: newPlaylistName, songs: [] };
    const updatedPlaylists = [...storedPlaylists, newPlaylist];

    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists); // Uppdatera state
    toast.success(`Spellistan "${newPlaylistName}" har skapats!`);
    setNewPlaylistName(""); // Återställ formuläret
    setShowModal(false); // Stäng modal
  };

  const handleAddSongToPlaylist = (playlistIndex: number, song: Track) => {
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

  const handleDeletePlaylist = (playlistIndex: number) => {
    const updatedPlaylists = playlists.filter((_, index) => index !== playlistIndex);
    setPlaylists(updatedPlaylists); 
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists)); 
    toast.success("Spellistan har tagits bort!");
  };

  const handleRemoveFromPlaylist = (playlistIndex: number, songId: string) => {
  const selectedPlaylist = playlists[playlistIndex];
  const updatedSongs = selectedPlaylist.songs.filter((song) => song.id !== songId);
  const updatedPlaylist = { ...selectedPlaylist, songs: updatedSongs };

  const updatedPlaylists = playlists.map((playlist, index) =>
    index === playlistIndex ? updatedPlaylist : playlist
  );

  setPlaylists(updatedPlaylists);
  localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
  toast.success("Låten har tagits bort från spellistan!");
};

const closeMenu = () => {
  setVisibleMenu(null);
};

const handleLogout = () => {
  localStorage.removeItem("spotifyAccessToken");
  logout();
};

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".menu-container")) {
      setOpenMenuId(null); // Stäng menyn
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

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

const indexOfLastSong = currentPage * itemsPerPage;
const indexOfFirstSong = indexOfLastSong - itemsPerPage;

const songsToRender = searchQuery
  ? filteredSongs.slice(indexOfFirstSong, indexOfLastSong)
  : savedSongs.slice(indexOfFirstSong, indexOfLastSong);



  return (
    <div className="saved-songs-container">
  
      <UserMenu />
      <button className="logout-btn" onClick={handleLogout}>
        Logga ut
      </button>
      <div className="create-playlist-container">
        <button title="Skapa ny spellista" onClick={() => setShowModal(true)}>+</button>
      </div>

      <SearchBar
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSearch={handleSearch} />
        <h1>Alla sparade låtar:</h1>

      {/* Visa sparade låtar */}
      <div className="gallery-container">
      {songsToRender.map((song, index) => (
     <div className="gallery-item" key={song.id}>
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
      <p className="song-name">{song.name}</p>
      <p className="song-artist">{song?.artists?.[0]?.name || "Okänd artist"}</p>

      {/* Tre prickar för meny */}
      <div className="menu-container">
        <button
          className="menu-button"
          onClick={() => handleToggleMenu(`${index}-${song.id}`)}
        >
          &#x22EE; {/* Unicode för tre prickar */}
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
          {playlist.songs.map((song) => (
            <div className="gallery-item" key={`${index}-${song.id}`}>
              <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <img
                  src={song.album?.images?.[0]?.url || "/path/to/default-image.jpg"}
                  alt={`${song.name} album art`}
                  className="gallery-image"
                />
              </a>
              <p className="song-name">{song.name}</p>
              <p className="song-artist">{song.artists[0].name}</p>
              <div className="menu-container">
        <button
          className="menu-button"
          onClick={() => handleToggleMenu(`${index}-${song.id}`)}
        >
          &#x22EE; {/* Unicode för tre prickar */}
        </button>
        {openMenuId === `${index}-${song.id}` && (
                <div className="menu-dropdown">
                  <button onClick={() => handleShareSong(song)}>Dela låt</button>
                  <button onClick={() => setShowSelect(!showSelect)}>Flytta spellista</button>
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
                    {playlists
                          .filter((_, playlistIndex) => playlistIndex !== index) 
                          .map((playlist, playlistIndex) => (
                      <option key={playlistIndex} value={playlistIndex}>
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                  )}
                  <button onClick={() => handleRemoveFromPlaylist(index,song.id)}>Ta bort</button>
                </div>
              )}
            </div>
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
