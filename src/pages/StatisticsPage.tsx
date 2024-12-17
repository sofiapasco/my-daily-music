import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";
import MoodStatistics from "../components/MoodStatistics";
import TopArtists from "../components/TopArtist";

const StatisticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week");
  const [likesCount, setLikesCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [activeDaysCount, setActiveDaysCount] = useState<number>(0);
  const { logout, userId } = useAuth();

  // Funktion för att hämta gillade låtar
  const getLikesThisPeriod = () => {
    if (!userId) return 0;

    const storageKey = `likedSongs_${userId}`;
    const likes = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const today = new Date();
    let startDate = new Date(today);

    if (selectedPeriod === "week") {
      startDate.setDate(today.getDate() - 7);
    } else if (selectedPeriod === "month") {
      startDate.setMonth(today.getMonth() - 1);
    }

    return likes.filter((like: { date: string }) => {
      const likeDate = new Date(like.date);
      return likeDate >= startDate && likeDate <= today;
    }).length;
  };

  // Funktion för att hämta dagboksdata
  const getDiaryData = () => {
    if (!userId) return;

    const storageKey = `musicDiary_${userId}`;
    const diaryEntries = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const today = new Date();
    let startDate = new Date(today);

    if (selectedPeriod === "week") {
      startDate.setDate(today.getDate() - 7);
    } else if (selectedPeriod === "month") {
      startDate.setMonth(today.getMonth() - 1);
    }

    // Filtrera inlägg inom perioden
    const filteredEntries = diaryEntries.filter((entry: { date: string }) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= today;
    });

    // Räkna unika aktiva dagar
    const uniqueDays = new Set(filteredEntries.map((entry: { date: string }) => entry.date));
    setActiveDaysCount(uniqueDays.size);

    // Räkna totalt antal kommentarer
    setCommentCount(filteredEntries.length);
  };

  useEffect(() => {
    const count = getLikesThisPeriod();
    setLikesCount(count);
  }, [selectedPeriod, userId]);

  useEffect(() => {
    getDiaryData();
  }, [selectedPeriod, userId]);

  return (
    <div className="statistics-container">
      <div className="header">
        <UserMenu />
        <button className="logout-btn" onClick={logout}>
          Logga ut
        </button>
      </div>
      <h1>Statistik</h1>

      {/* Välj period för statistik */}
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

      {/* Gillade låtar */}
      <p>
        Du har gillat <strong>{likesCount} låtar</strong> under den här{" "}
        {selectedPeriod === "week" ? "veckan" : "månaden"}.
      </p>

      {/* Top Artists */}
      <TopArtists selectedPeriod={selectedPeriod} />

      {/* Aktiva dagar */}
      <p>
        Du har varit aktiv <strong>{activeDaysCount} dagar</strong> under den här{" "}
        {selectedPeriod === "week" ? "veckan" : "månaden"}.
      </p>

      {/* Kommentarantal */}
      <p>
        Du har skrivit <strong>{commentCount} kommentarer</strong> under den senaste{" "}
        {selectedPeriod === "week" ? "veckan" : "månaden"}.
      </p>

      {/* Mood Statistics */}
      {selectedPeriod === "week" ? (
        <MoodStatistics />
      ) : (
        <p style={{ textAlign: "center", marginTop: "20px", color: "#555" }}>
          Grafen är endast tillgänglig för veckostatistik.
        </p>
      )}
    </div>
  );
};

export default StatisticsPage;
