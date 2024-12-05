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
      const artistCount = likedSongs.reduce<Record<string, number>>((acc, song) => {
        song.artists.forEach((artist) => {
          acc[artist.name] = (acc[artist.name] || 0) + 1;
        });
        return acc;
      }, {});

      // Hitta artisten med flest förekomster
      const sortedArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]);
      const [topName, topCount] = sortedArtists[0] || ["", 0];
      setTopArtist({ name: topName, count: topCount });
    } else {
      setTopArtist(null);
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
