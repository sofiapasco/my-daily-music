import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MoodSelection: React.FC = () => {
  const { logout} = useAuth();
  const [mood, setMood] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleMoodSelection = (selectedMood: string) => {
    console.log("Valt humör:", selectedMood);
    setMood(selectedMood);
    localStorage.setItem("selectedMood", selectedMood);
    console.log("Humör sparat i localStorage:", selectedMood);
    navigate("/daily-song")

  };

  return (
    <div className="mood-selection-container">
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
      <button onClick={() => navigate("/daily-song")}>Hoppa över</button>

    </div>
  );
};

export default MoodSelection;
