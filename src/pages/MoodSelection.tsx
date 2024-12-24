import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";

const MoodSelection: React.FC = () => {
  const [mood, setMood] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>(""); 
  const { logout, userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const currentTime = new Date();
    const hours = currentTime.getHours();

    let greetingMessage = "Hej";
    if (hours >= 5 && hours < 12) {
      greetingMessage = "God morgon";
    } else if (hours >= 12 && hours < 18) {
      greetingMessage = "God eftermiddag";
    } else if (hours >= 18 && hours < 22) {
      greetingMessage = "God kväll";
    } else {
      greetingMessage = "God natt";
    }

    if (userId) {
      setGreeting(`${greetingMessage}, ${userId}!\n\nHur mår du idag?`);
    } else {
      setGreeting("Hej!\n\nHur mår du idag?");
    }    
  }, [userId]);


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
          setMood(parsedMood.mood); 
        
        navigate("/daily-song"); 
      }
    }
  }, [userId, navigate]);

  const saveMood = (selectedMood: string) => {
    if (!userId) {
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
    } catch (error) {
      console.error("Fel vid sparande av humördata:", error);
    }
  };

  const handleMoodSelection = (selectedMood: string) => {
    saveMood(selectedMood);
    setMood(selectedMood);
    navigate("/daily-song");
  };

  const handleSkip = () => {
    saveMood("neutral");
    navigate("/daily-song");
  };
  console.log("Användarens valda humör är:", mood);

  return (
      <div className="mood-selection-container" style={{height: "100vh"}}>
      <div className="header">
        <UserMenu />
        <button className="logout-btn" onClick={logout}>
          Logga ut
        </button>
      </div>
      <h1>{greeting}</h1>  
      <div className="mood-buttons">
        <button onClick={() => handleMoodSelection("😊")}>😊</button>
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
          backgroundColor: "#922692", 
          color: "white", 
          padding: "6px 9px", 
          border: "none", 
          borderRadius: "6px", 
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        Hoppa över
      </button>
    </div>
  );
};

export default MoodSelection;
