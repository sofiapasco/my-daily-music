import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";

const MoodSelection: React.FC = () => {
  const { logout } = useAuth();
  const [mood, setMood] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleMoodSelection = (selectedMood: string) => {
    const today = new Date().toISOString().split("T")[0];
    const moodHistory = JSON.parse(localStorage.getItem("moodData") || "[]");

    // Uppdatera moodData
    const updatedMoodData = [
      ...moodHistory.filter((entry: { date: string }) => entry.date !== today),
      { date: today, mood: selectedMood },
    ];

    localStorage.setItem("moodData", JSON.stringify(updatedMoodData));
    console.log("Uppdaterad humördata:", updatedMoodData);

    setMood(selectedMood);
    localStorage.setItem("selectedMood", selectedMood);
    navigate("/daily-song");
  };

  const handleSkip = () => {
    const today = new Date().toISOString().split("T")[0];
    const moodHistory = JSON.parse(localStorage.getItem("moodData") || "[]");

    const updatedMoodData = [
      ...moodHistory.filter((entry: { date: string }) => entry.date !== today),
      { date: today, mood: "neutral" },
    ];

    localStorage.setItem("moodData", JSON.stringify(updatedMoodData));
    console.log("Hoppa över: Standardhumör 'neutral' tillagd");

    navigate("/daily-song");
  };

  return (
    <div className="mood-selection-container">
      <UserMenu />
      <button className="logout-btn" onClick={logout}>
        Logga ut
      </button>
      <h1>HUR MÅR DU IDAG?</h1>
      <div className="mood-buttons">
        <button onClick={() => handleMoodSelection("😊")}> 😊</button>
        <button onClick={() => handleMoodSelection("😢")}>😢</button>
        <button onClick={() => handleMoodSelection("😌")}>😌</button>
        <button onClick={() => handleMoodSelection("😴")}>😴</button>
        <button onClick={() => handleMoodSelection("💪")}>💪</button>
        <button onClick={() => handleMoodSelection("🥰")}>🥰</button>
      </div>
      <br />
      <button onClick={handleSkip}>Hoppa över</button>
    </div>
  );
};

export default MoodSelection;
