import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Track } from "../types/Song";
import Pagination from "../components/Pagination";
import { toast } from "react-toastify";

const PlaylistDetails: React.FC = () => {
  const [playlists, setPlaylists] = useState<{ name: string; songs: Track[] }[]>([]);
  const { playlistName } = useParams<{ playlistName: string }>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const storedPlaylists = localStorage.getItem("playlists");
    if (storedPlaylists) {
      setPlaylists(JSON.parse(storedPlaylists));
    }
  }, []);

  const playlist = playlists.find((p) => p.name === playlistName);

  if (!playlist) {
    return <p>Spellistan finns inte!</p>;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const indexOfLastSong = currentPage * itemsPerPage;
  const indexOfFirstSong = indexOfLastSong - itemsPerPage;
  const songsToRender = playlist.songs.slice(indexOfFirstSong, indexOfLastSong);

  const handleShareSong = (song: Track) => {
    const shareText = `Lyssna på "${song.name}" av ${song.artists[0].name}: ${song.external_urls.spotify}`;
    navigator.clipboard.writeText(shareText);
    alert("Länk kopierad till urklipp!");
  };

  const handleAddSongToPlaylist = (playlistIndex: number, song: Track) => {
    const updatedPlaylists = [...playlists];
    updatedPlaylists[playlistIndex].songs.push(song);
    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
  };

  const handleRemoveFromSavedSongs = (songId: string) => {
    const updatedSongs = playlist.songs.filter((song) => song.id !== songId);
    const updatedPlaylist = { ...playlist, songs: updatedSongs };
    const updatedPlaylists = playlists.map((p) =>
      p.name === playlist.name ? updatedPlaylist : p
    );
    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
  };

  const handleToggleMenu = (menuId: string) => {
    setOpenMenuId(openMenuId === menuId ? null : menuId);
  };

  const handleDeletePlaylist = (playlistIndex: number) => {
    const updatedPlaylists = playlists.filter((_, index) => index !== playlistIndex);
    setPlaylists(updatedPlaylists); 
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists)); 
    toast.success("Spellistan har tagits bort!");
  };


  return (
    <div className="playlist-details">
      <h2 style={{margin:"20px"}}>{playlist.name}</h2>
      <p style={{marginLeft:"20px", fontSize:"13px"}}>{playlist.songs.length} låtar</p>
      <button 
          onClick={() => handleDeletePlaylist} 
          className="delete-playlist-btn" 
          style={{
            background: "none",
            border: "none",
            padding: "0",
            cursor: "pointer",
            marginLeft:"20px"
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
                      {playlists.map((p, idx) => (
                        <option key={idx} value={idx}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button onClick={() => handleRemoveFromSavedSongs(song.id)}>
                    Ta bort
                  </button>
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
