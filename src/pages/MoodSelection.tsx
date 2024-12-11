import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";

const MoodSelection: React.FC = () => {
  const [mood, setMood] = useState<string | null>(null);
  const { logout, userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      console.error("Ingen användare inloggad.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const selectedMoodKey = `selectedMood_${userId}`;

    const storedMood = localStorage.getItem(selectedMoodKey);

    if (storedMood) {
      const parsedMood = JSON.parse(storedMood);

      if (parsedMood.date === today) {
        console.log("Humör redan valt idag:", parsedMood.mood);
        navigate("/daily-song"); // Om humör redan är valt för idag, navigera bort
      }
    }
  }, [userId, navigate]);

  const saveMood = (selectedMood: string) => {
    if (!userId) {
      console.error("Ingen användare inloggad.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const moodHistoryKey = `moodData_${userId}`;
    const selectedMoodKey = `selectedMood_${userId}`;

    try {
      const moodHistory = JSON.parse(localStorage.getItem(moodHistoryKey) || "[]");
      const updatedMoodData = [
        ...moodHistory.filter((entry: { date: string }) => entry.date !== today),
        { date: today, mood: selectedMood },
      ];

      localStorage.setItem(moodHistoryKey, JSON.stringify(updatedMoodData));
      localStorage.setItem(
        selectedMoodKey,
        JSON.stringify({ mood: selectedMood, date: today })
      );

      console.log(`Humördata sparat: ${selectedMood} för ${userId}`, updatedMoodData);
    } catch (error) {
      console.error("Fel vid sparande av humördata:", error);
    }
  };

  const handleMoodSelection = (selectedMood: string) => {
    console.log(`Valt humör: ${selectedMood}`);
    saveMood(selectedMood);
    setMood(selectedMood);
    navigate("/daily-song");
  };

  const handleSkip = () => {
    console.log("Användaren hoppade över val av humör.");
    saveMood("neutral");
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
      <button 
        onClick={handleSkip} 
        style={{
          backgroundColor: "#4CAF50", 
          color: "white", 
          padding: "10px 20px", 
          border: "none", 
          borderRadius: "5px", 
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Hoppa över
      </button>
    </div>
  );
};

export default MoodSelection;
