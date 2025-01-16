import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";
import { saveMoodToFirestore, fetchFromFirestore, } from "../service/firestoreService";

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

  console.log("användarens", mood)

  useEffect(() => {
    if (!userId) {
      console.error("Ingen användare inloggad.");
      return;
    }
  
    const fetchMoodHistory = async () => {
      try {
        const moodHistoryDoc = await fetchFromFirestore(`users/${userId}/data`, "moodHistory");
        if (moodHistoryDoc && Array.isArray(moodHistoryDoc.entries)) {
          const today = new Date().toISOString().split("T")[0];
          const todayMood = moodHistoryDoc.entries.find((entry: { date: string }) => entry.date === today);
          if (todayMood) {
            console.log("Dagens humör redan sparat:", todayMood);
            setMood(todayMood.mood);
            navigate("/daily-song");
          }
        }
      } catch (error) {
        console.error("Fel vid hämtning av humörhistorik från Firestore:", error);
      }
    };
  
    fetchMoodHistory();
  }, [userId, navigate]);  
  

  const handleMoodSelection = async (selectedMood: string) => {
    if (!userId) {
      console.warn("Ingen användare inloggad.");
      return;
    }
  
    try {
      const today = new Date().toISOString().split("T")[0];
  
      const moodHistoryDoc = await fetchFromFirestore(`users/${userId}/data`, "moodHistory");
      const existingMoodHistory = moodHistoryDoc?.entries || [];

      const updatedMoodHistory = [
        ...existingMoodHistory.filter((entry: { date: string }) => entry.date !== today),
        { date: today, mood: selectedMood },
      ].slice(-7);
  
      await saveMoodToFirestore(userId, updatedMoodHistory);
  
      setMood(selectedMood); 
      navigate("/daily-song"); 
    } catch (error) {
      console.error("Fel vid sparande av humör till historik:", error);
    }
  };  
  
  const handleSkip = async () => {
    if (!userId) {
      console.warn("Ingen användare inloggad.");
      return;
    }
  
    try {
      const today = new Date().toISOString().split("T")[0];

      const moodHistoryDoc = await fetchFromFirestore(`users/${userId}/data`, "moodHistory");
      const existingMoodHistory = moodHistoryDoc?.entries || [];
  
      const updatedMoodHistory = [
        ...existingMoodHistory.filter((entry: { date: string }) => entry.date !== today),
        { date: today, mood: "neutral" },
      ].slice(-7);
  
      await saveMoodToFirestore(userId, updatedMoodHistory);
  
      navigate("/daily-song"); 
    } catch (error) {
      console.error("Fel vid sparande av neutralt humör:", error);
    }
  };
  
  return (
    <div className="mood-selection-container" style={{ height: "100vh" }}>
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

