import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MoodSelection: React.FC = () => {
  const { logout} = useAuth();
  const [mood, setMood] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleMoodSelection = (selectedMood: string) => {
    setMood(selectedMood);
    localStorage.setItem("selectedMood", selectedMood);
    navigate("/daily-song");
  };

  return (
    <div className="mood-selection-container">
       <button className="logout-btn" onClick={logout}>
        Logga ut
      </button>
      <h1>HUR MÅR DU IDAG?</h1>
      <div className="mood-buttons">
        <button onClick={() => handleMoodSelection("Glad")}> 😊</button>
        <button onClick={() => handleMoodSelection("Ledsen")}>😢</button>
        <button onClick={() => handleMoodSelection("Avslappnad")}>😌</button>
        <button onClick={() => handleMoodSelection("Taggad")}>💪</button>
      </div>
    </div>
  );
};

export default MoodSelection;
