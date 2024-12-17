import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
import { useAuth } from '../context/AuthContext';

interface Song {
  title: string;
  artist: string;
  link: string;
}

interface ShareSongProps {
  song: Song;
}

const ShareSong: React.FC<ShareSongProps> = ({ song }) => {
  const { title, artist, link } = song;
  const {userId} = useAuth();
  const [comment, setComment] = useState<string>("");
  const [showCommentBox, setShowCommentBox] = useState<boolean>(false);

  const shareText = `Lyssna på "${title}" av ${artist}!`;
  const shareUrl = link; 
  const handleWebShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Dela låt`,
        text: shareText,
        url: shareUrl,
      })
        .then(() => console.log('Låten delades!'))
        .catch((err) => console.error('Dela misslyckades', err));
    } else {
      alert('Web Share API stöds inte på denna enhet.');
    }
  };

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(shareText);
    toast.success(
      "Länken och texten har kopierats! Öppna Instagram och klistra in i din story eller post."
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    toast.success('Länken har kopierats!');
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value); // Uppdatera kommentaren i state
  };
  
  const handleSaveComment = () => {
    if (!comment.trim()) {
      toast.error("Kommentaren kan inte vara tom."); // Felmeddelande om kommentaren är tom
      return;
    }
  
    const today = new Date().toISOString().split("T")[0]; 
    const songTitle = title || "Okänd låt"; 
    const newComment = {
      date: today,
      songTitle,
      comment,
    };
  
    const storedComments = JSON.parse(localStorage.getItem(`musicDiary_${userId}`) || "[]");
    const updatedComments = [...storedComments, newComment];
  
    localStorage.setItem(`musicDiary_${userId}`, JSON.stringify(updatedComments));
  
    toast.success("Kommentaren har sparats! 🎉");
    setShowCommentBox(false); 
    setComment(""); 
  };  

  const toggleCommentBox = () => {
    setShowCommentBox((prev) => !prev);
  };


  return (
    <div className="share-song">
      <div className="social-buttons">
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="facebook-button"
          style={{marginTop: "10px"}}
        >
          <img src="/facebook.png" alt="Dela på Facebook" className="icon" id="fbicon" />
        </a>

        {/* Kopiera länk */}
        <button onClick={handleCopyLink} className="copy-link-button">
          <img src="/copy.png" alt="Kopiera länk" className="icon" id="copyicon" />
        </button>

        {/* Instagram-delning */}
        <button onClick={handleInstagramShare} className="instagram-button">
          <img src="/instagram.png" alt="Dela på Instagram" className="icon" />
        </button>

        {/* Web Share API */}
        <button onClick={handleWebShare} className="mobile-share-button">
          <img src="/share.png" alt="Dela via mobil" className="icon" id="phoneicon" />
        </button>
        <button
          onClick={toggleCommentBox}
          className="add-comment-btn"
          style={{
            marginBottom: "10px",
            cursor: "pointer",
            background: "none",
            border: "none",
          }}
        >
          <FontAwesomeIcon icon={faPencil} style={{ fontSize: "24px", color: "#333" }} />
        </button>

        {showCommentBox && (
          <div
            className="comment-section"
            style={{
              position: "absolute",
              top: "0",
              left: "40",
              width: "200px",
              marginTop: "630px",
              marginLeft: "200px",

              borderRadius: "5px",
              padding: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              transition: "all 0.3s ease",
            }}
          >
            <textarea
              placeholder="Skriv en kommentar om låten..."
              value={comment}
              onChange={handleCommentChange}
              className="comment-input"
              style={{       
                left: "5",  
                margin: "0",
                width: "100%",
                height: "80px",
                padding: "5px",
                borderRadius: "5px",

              }}
            ></textarea>
            <button
              onClick={handleSaveComment}
              className="save-comment-btn"
              style={{
                marginTop: "5px",
                border: "none",
                background: "linear-gradient(135deg, #922692, #bb4180c6)",
                borderRadius: "5px",
                padding: "5px 10px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Spara kommentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareSong;