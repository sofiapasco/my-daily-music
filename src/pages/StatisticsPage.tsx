import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";
import MoodStatistics from "../components/MoodStatistics";
import TopArtists from "../components/TopArtist";

const StatisticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week");
  const [likesCount, setLikesCount] = useState(0);
  const { logout } = useAuth();

  const getLikesThisPeriod = () => {
    const likes = JSON.parse(localStorage.getItem("likedSongs") || "[]");

    const today = new Date();
    let startDate = new Date(today);

    if (selectedPeriod === "week") {
      startDate.setDate(today.getDate() - 7);
    } else if (selectedPeriod === "month") {
      startDate.setMonth(today.getMonth() - 1);
    }

    // Filtrera låtar baserat på datum
    return likes.filter((like: { date: string }) => {
      const likeDate = new Date(like.date);
      return likeDate >= startDate && likeDate <= today;
    }).length;
  };

  // Uppdatera antal gillade låtar baserat på vald period
  useEffect(() => {
    const count = getLikesThisPeriod();
    setLikesCount(count);
  }, [selectedPeriod]);

  const handleLogout = () => {
    localStorage.removeItem("spotifyAccessToken");
    logout();
  };

  return (
    <div className="statistics-container">
      <UserMenu />
      <button className="logout-btn" onClick={handleLogout}>
        Logga ut
      </button>
      <h1>Statistik</h1>
      <div className="statistics-period">
        <select
          id="period-select"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as "week" | "month")}
        >
          <option value="week">Senaste veckan</option>
          <option value="month">Senaste månaden</option>
        </select>
      </div>
      <p>Du har gillat {likesCount} låtar under den här {selectedPeriod === "week" ? "veckan" : "månaden"}.</p>

      {/* Lägg till TopArtists-komponenten */}
      <TopArtists selectedPeriod={selectedPeriod} />

      {/* MoodStatistics-komponenten */}
      <MoodStatistics />
    </div>
  );
};

export default StatisticsPage;
