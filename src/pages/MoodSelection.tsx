import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";

const MoodSelection: React.FC = () => {
  const [mood, setMood] = useState<string | null>(null);
  const { logout, userId } = useAuth(); 
  const navigate = useNavigate();

  const handleMoodSelection = (selectedMood: string) => {
    if (!userId) {
      console.error("Ingen användare inloggad.");
      return;
    }
  
    const today = new Date().toISOString().split("T")[0];
    const moodHistoryKey = `moodData_${userId}`;
    const selectedMoodKey = `selectedMood_${userId}`; 
  
    const moodHistory = JSON.parse(localStorage.getItem(moodHistoryKey) || "[]");
  
    const updatedMoodData = [
      ...moodHistory.filter((entry: { date: string }) => entry.date !== today),
      { date: today, mood: selectedMood },
    ];
  
    localStorage.setItem(moodHistoryKey, JSON.stringify(updatedMoodData));
  localStorage.setItem(selectedMoodKey, selectedMood);
  console.log(`Humördata och valt humör uppdaterade för ${userId}:`, updatedMoodData, selectedMood);

  setMood(selectedMood);
  navigate("/daily-song");
};

  const handleSkip = () => {
    if (!userId) {
      console.error("Ingen användare inloggad.");
      return;
    }
  
    const today = new Date().toISOString().split("T")[0];
    const moodHistoryKey = `moodData_${userId}`; // Nyckeln inkluderar userId
  
    const moodHistory = JSON.parse(localStorage.getItem(moodHistoryKey) || "[]");
  
    // Lägg till neutralt humör
    const updatedMoodData = [
      ...moodHistory.filter((entry: { date: string }) => entry.date !== today),
      { date: today, mood: "neutral" },
    ];
  
    localStorage.setItem(moodHistoryKey, JSON.stringify(updatedMoodData));
    console.log(`Neutralt humör registrerat för ${userId}`);
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
