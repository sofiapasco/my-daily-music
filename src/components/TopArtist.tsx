import React, { useEffect, useState } from "react";
import { Track } from "../types/Song";

const TopArtists: React.FC = () => {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [topArtist, setTopArtist] = useState<{ name: string; count: number } | null>(null);

  useEffect(() => {
    // Hämta gillade låtar från localStorage
    const storedLikedSongs = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    setLikedSongs(storedLikedSongs);
  }, []);

  useEffect(() => {
    if (likedSongs.length > 0) {
      // Räkna förekomsten av varje artist
      const artistCount: Record<string, number> = {};

      likedSongs.forEach((song) => {
        song.artists.forEach((artist) => {
          artistCount[artist.name] = (artistCount[artist.name] || 0) + 1;
        });
      });

      // Hitta artisten med flest förekomster
      const top = Object.entries(artistCount).reduce(
        (acc, [artist, count]) => (count > acc.count ? { name: artist, count } : acc),
        { name: "", count: 0 }
      );

      setTopArtist(top);
    }
  }, [likedSongs]);

  return (
    <div className="top-artists-container">
      {topArtist ? (
        <p>
          Din favoritartist är <strong>{topArtist.name}</strong> med {topArtist.count} låtar!
        </p>
      ) : (
        <p>Du har inte gillat några låtar ännu.</p>
      )}
    </div>
  );
};

export default TopArtists;
