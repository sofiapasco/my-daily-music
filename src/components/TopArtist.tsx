import React, { useEffect, useState } from "react";
import { Track } from "../types/Song";

interface TopArtistsProps {
  selectedPeriod: "week" | "month";
}

const TopArtists: React.FC<TopArtistsProps> = ({ selectedPeriod }) => {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    // Hämta gillade låtar från localStorage
    const storedLikedSongs = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    setLikedSongs(storedLikedSongs);
  }, []);

  useEffect(() => {
    if (likedSongs.length > 0) {
      const today = new Date();
      let startDate = new Date(today);

      if (selectedPeriod === "week") {
        startDate.setDate(today.getDate() - 7);
      } else if (selectedPeriod === "month") {
        startDate.setMonth(today.getMonth() - 1);
      }

      // Filtrera låtar baserat på vald period
      const filteredSongs = likedSongs.filter((song) => {
        const likeDate = new Date(song.date);
        return likeDate >= startDate && likeDate <= today;
      });

      // Räkna förekomsten av varje artist
      const artistCount = filteredSongs.reduce<Record<string, number>>((acc, song) => {
        song.artists.forEach((artist) => {
          acc[artist.name] = (acc[artist.name] || 0) + 1;
        });
        return acc;
      }, {});

      // Sortera artisterna efter antal låtar
      const sortedArtists = Object.entries(artistCount)
        .sort((a, b) => b[1] - a[1]) // Sortera i fallande ordning
        .map(([name, count]) => ({ name, count }));

      // Visa en artist för veckan och topp 3 för månaden
      if (selectedPeriod === "week") {
        setTopArtists(sortedArtists.slice(0, 1)); // Bara den främsta artisten
      } else if (selectedPeriod === "month") {
        setTopArtists(sortedArtists.slice(0, 3)); // Topp 3 artister
      }
    } else {
      setTopArtists([]);
    }
  }, [likedSongs, selectedPeriod]);

  return (
    <div className="top-artists-container">
      {topArtists.length > 0 ? (
        <p>
          {selectedPeriod === "week"
            ? `Favoritartisten för veckan är ${topArtists[0].name}.`
            : `Topp 3 artisterna för månaden är: ${topArtists
                .map((artist) => `${artist.name}`)
                .join(", ")}.`}
        </p>
      ) : (
        <p>Inga gillade låtar under denna period.</p>
      )}
    </div>
  );
};

export default TopArtists;
