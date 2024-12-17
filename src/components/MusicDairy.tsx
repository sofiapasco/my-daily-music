import React, { useState, useEffect } from "react";
import UserMenu from "./UserMenu";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

interface DiaryEntry {
  date: string;
  songTitle: string;
  comment: string;
}

const MusicDiary: React.FC = () => {
  const { userId, logout } = useAuth();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [dailySong, setDailySong] = useState<string>("Okänd låt");
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // Index för redigering
  const [editComment, setEditComment] = useState<string>(""); // Kommentar som redigeras

  useEffect(() => {
    if (userId) {
      const storedDailySong = localStorage.getItem(`dailySong_${userId}`);
      if (storedDailySong) {
        try {
          const parsedSong = JSON.parse(storedDailySong);
          setDailySong(parsedSong.name || "Okänd låt");
        } catch (error) {
          console.error("Fel vid tolkning av dailySong från localStorage:", error);
          setDailySong("Okänd låt");
        }
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const storedDiary = localStorage.getItem(`musicDiary_${userId}`);
    if (storedDiary) {
      setDiaryEntries(JSON.parse(storedDiary));
    }
  }, [userId]);

  const handleSaveEntry = () => {
    if (!newComment.trim()) return;

    const today = new Date().toISOString().split("T")[0];
    const newEntry: DiaryEntry = { date: today, songTitle: dailySong, comment: newComment };
    const updatedEntries = [...diaryEntries, newEntry];

    setDiaryEntries(updatedEntries);
    localStorage.setItem(`musicDiary_${userId}`, JSON.stringify(updatedEntries));

    setNewComment("");
    toast.success("Dagens kommentar har sparats!");
  };

  const handleDeleteEntry = (index: number) => {
    const updatedEntries = diaryEntries.filter((_, i) => i !== index);
    setDiaryEntries(updatedEntries);
    localStorage.setItem(`musicDiary_${userId}`, JSON.stringify(updatedEntries));
    toast.info("Inlägget har raderats.");
  };

  const handleEditEntry = (index: number) => {
    setEditingIndex(index);
    setEditComment(diaryEntries[index].comment);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const updatedEntries = [...diaryEntries];
      updatedEntries[editingIndex].comment = editComment;
      setDiaryEntries(updatedEntries);
      localStorage.setItem(`musicDiary_${userId}`, JSON.stringify(updatedEntries));
      setEditingIndex(null);
      setEditComment("");
      toast.success("Inlägget har uppdaterats.");
    }
  };

  return (
    <div className="music-diary-container" style={{ height: "100vh" }}>
      <div className="header">
        <UserMenu />
        <button className="logout-btn" onClick={logout}>
          Logga ut
        </button>
      </div>
      <header>
        <h1>Din Musikdagbok</h1>
        <p>Spara dagens tankar om din musik.</p>
      </header>

      <div className="diary-entry">
        <h2>Dagens låt: {dailySong}</h2>
        <textarea
          placeholder="Skriv en kommentar om dagens låt..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>
        <button onClick={handleSaveEntry}>💾 Spara Kommentar</button>
      </div>

      <div className="diary-history">
        <h2>📅 Tidigare dagboksinlägg:</h2>
        {diaryEntries.length > 0 ? (
          <ul>
          {diaryEntries.map((entry, index) => (
            <li key={index} className="diary-item">
              <div className="diary-item-content">
                <strong>{entry.date}:</strong> {entry.songTitle}
                {editingIndex === index ? (
                  <>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                    ></textarea>
                    <button onClick={handleSaveEdit}>💾 Spara Ändring</button>
                    <button onClick={() => setEditingIndex(null)}>❌ Avbryt</button>
                  </>
                ) : (
                  <p>📝 {entry.comment}</p>
                )}
              </div>
        
              {/* Knappar placerade på högra sidan */}
              <div className="diary-buttons">
                {editingIndex !== index && (
                  <>
                    <button onClick={() => handleEditEntry(index)}>✏️ </button>
                    <button
                      onClick={() => handleDeleteEntry(index)}
                      className="delete-btn"
                    >
                      🗑️ 
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        
        ) : (
          <p>Inga inlägg ännu. Skriv ditt första idag! 🎧</p>
        )}
      </div>
    </div>
  );
};

export default MusicDiary;
