import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Track } from "../types/song";
import Pagination from "../components/Pagination";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";

const PlaylistDetails: React.FC = () => {
  const [playlists, setPlaylists] = useState<{ name: string; songs: Track[] }[]>([]);
  const { playlistName } = useParams<{ playlistName: string }>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { userId, logout } = useAuth();

  useEffect(() => {
    // Kontrollera om userId är tillgängligt
    if (!userId) {
      console.error("Ingen användare inloggad.");
      return;
    }
  
    // Bygg nyckeln för att hämta spellistor kopplade till användaren
    const storageKey = `playlists_${userId}`;
    const storedPlaylists = localStorage.getItem(storageKey);
  
    // Kontrollera om det finns sparade spellistor för användaren
    if (storedPlaylists) {
      setPlaylists(JSON.parse(storedPlaylists));
    } else {
      console.warn(`Inga spellistor hittades för användare: ${userId}`);
      setPlaylists([]); // Om det inte finns några spellistor, sätt till en tom array
    }
  }, [userId]); // Kör denna `useEffect` igen om `userId` ändras
  

  // Hitta spellistan baserat på `name`
  const playlist = playlists.find((p) => p.name === playlistName);

  if (!playlist) {
    return <p>Spellistan finns inte!</p>;
  }

  // Hantera sidbyte
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Paginering
  const indexOfLastSong = currentPage * itemsPerPage;
  const indexOfFirstSong = indexOfLastSong - itemsPerPage;
  const songsToRender = playlist.songs.slice(indexOfFirstSong, indexOfLastSong);

  // Dela låt
  const handleShareSong = (song: Track) => {
    if (!song?.artists?.[0]) {
      toast.error("Kunde inte hitta artistinformation.");
      return;
    }

    const shareText = `Lyssna på "${song.name}" av ${song.artists[0].name}: ${song.external_urls.spotify}`;
    navigator.clipboard.writeText(shareText);
    toast.success("Länk kopierad till urklipp!");
  };

  // Lägg till låt i en annan spellista
  const handleAddSongToPlaylist = (targetPlaylistName: string, song: Track) => {
    const targetPlaylist = playlists.find((p) => p.name === targetPlaylistName);
    if (!targetPlaylist) {
      toast.error("Målspellistan hittades inte.");
      return;
    }

    const updatedSongs = [...targetPlaylist.songs, song];
    const updatedPlaylists = playlists.map((p) =>
      p.name === targetPlaylistName ? { ...p, songs: updatedSongs } : p
    );

    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    toast.success(`"${song.name}" har lagts till i spellistan "${targetPlaylistName}"`);
  };

  // Ta bort låt från spellistan
  const handleRemoveFromSavedSongs = (songId: string) => {
    const updatedSongs = playlist.songs.filter((song) => song.id !== songId);
    const updatedPlaylist = { ...playlist, songs: updatedSongs };
    const updatedPlaylists = playlists.map((p) =>
      p.name === playlist.name ? updatedPlaylist : p
    );

    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    toast.success("Låten har tagits bort från spellistan!");
  };

  // Radera spellista
  const handleDeletePlaylist = () => {
    const updatedPlaylists = playlists.filter((p) => p.name !== playlist.name);
    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    toast.success("Spellistan har tagits bort!");
    navigate("/"); // Navigera tillbaka till startsidan eller annan sida
  };

  // Hantera menyöppning
  const handleToggleMenu = (menuId: string) => {
    setOpenMenuId(openMenuId === menuId ? null : menuId);
  };

  return (
    <div className="playlist-details">
         <div className="header">
        <UserMenu />
        <button className="logout-btn" onClick={logout}>
          Logga ut
        </button>
        </div>
      <h2 style={{ margin: "20px" }}>{playlist.name}</h2>
      <p style={{ marginLeft: "20px", fontSize: "13px" }}>{playlist.songs.length} låtar</p>
      <button
        onClick={handleDeletePlaylist}
        className="delete-playlist-btn"
        style={{
          background: "none",
          border: "none",
          padding: "0",
          cursor: "pointer",
          marginLeft: "20px",
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
      <div className="gallery-container">
        {songsToRender.map((song, index) => (
          <div key={song.id || index} className="gallery-item">
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
              <button className="menu-button" onClick={() => handleToggleMenu(song.id)}>
                &#x22EE;
              </button>
              {openMenuId === song.id && (
                <div className="menu-dropdown">
                  <button onClick={() => handleShareSong(song)}>Dela låt</button>
                  {showSelect && (
                    <select
                      onChange={(e) => {
                        handleAddSongToPlaylist(e.target.value, song);
                        setShowSelect(false);
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Välj spellista
                      </option>
                      {playlists.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
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
        totalItems={playlist.songs.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PlaylistDetails;
