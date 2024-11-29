import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";

const MoodSelection: React.FC = () => {
  const { logout} = useAuth();
  const [mood, setMood] = useState<string | null>(null);
  const navigate = useNavigate();


  const handleMoodSelection = (selectedMood: string) => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    console.log("Valt humör:", selectedMood);

    setMood(selectedMood);
    localStorage.setItem("selectedMood", selectedMood);
    localStorage.setItem("moodDate", dateKey); // Spara dagens datum
    console.log("Humör och datum sparade i localStorage:", selectedMood, dateKey);

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
      <br></br>

      <button onClick={() => navigate("/daily-song")}>Hoppa över</button>

    </div>
  );
};

export default MoodSelection;
