import React, { useState, useEffect } from "react";
import UserMenu from "./UserMenu";
import Pagination from "./Pagination";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

interface DiaryEntry {
    date: string;
    time: string; // Ny fält för tid
    songTitle: string;
    comment: string;
  }
  

const MusicDiary: React.FC = () => {
  const { userId, logout } = useAuth();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [dailySong, setDailySong] = useState<string>("Okänd låt");
  const [editingIndex, setEditingIndex] = useState<number | null>(null); 
  const [editComment, setEditComment] = useState<string>(""); 

  const [currentPage, setCurrentPage] = useState<number>(1);
  const entriesPerPage = 10;

  useEffect(() => {
    if (userId) {
      const today = new Date().toISOString().split("T")[0]; 
      const storedDailySong = localStorage.getItem(`dailySong_${userId}_${today}`);
  
      if (storedDailySong) {
        try {
          const parsedSong = JSON.parse(storedDailySong);
          setDailySong(parsedSong.name || "Okänd låt"); 
        } catch (error) {
          console.error("Fel vid tolkning av dailySong från localStorage:", error);
          setDailySong("Okänd låt");
        }
      } else {
        setDailySong("Okänd låt"); 
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

    const sortedEntries = diaryEntries
    .slice()
    .sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`);
    const dateTimeB = new Date(`${b.date}T${b.time}`);
    return dateTimeB.getTime() - dateTimeA.getTime(); 
    });

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = sortedEntries.slice(indexOfFirstEntry, indexOfLastEntry);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSaveEntry = () => {
    if (!newComment.trim()) return;
  
    const today = new Date();
    const date = today.toISOString().split("T")[0]; 
    const time = today.toTimeString().split(" ")[0].slice(0, 5); 
  
    const newEntry: DiaryEntry = { 
      date, 
      time,
      songTitle: dailySong, 
      comment: newComment 
    };
  
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
            {currentEntries.map((entry, index) => (
            <li key={index} className="diary-item">
                <div className="diary-item-content">
                <span className="song-title">{entry.songTitle} </span>
                <br/>
                <strong>{entry.date}</strong>
                <br/>
                <span className="time-stamp">kl. {entry.time} </span>
                {editingIndex === index ? (
                    <div className="editing-area">
                    <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                    ></textarea>
                    <div>
                        <button onClick={handleSaveEdit} >Spara Ändring</button>
                        <button onClick={() => setEditingIndex(null)}>Avbryt</button>
                    </div>
                    </div>
                ) : (
                    <p className="comment">📝 {entry.comment}</p>
                )}
                </div>

                <div className="diary-buttons">
                {editingIndex !== index && (
                    <>
                    <button onClick={() => handleEditEntry(index)}>✏️</button>
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
        <Pagination
          totalItems={diaryEntries.length}
          itemsPerPage={entriesPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default MusicDiary;
