import React, { useState } from "react";
import { likeSong } from "../service/likeSongService";

type LikeSongButtonProps = {
  trackId: string; // Låtens ID
  accessToken: string; // Användarens Spotify Access Token
};

const LikeSongButton: React.FC<LikeSongButtonProps> = ({ trackId, accessToken }) => {
  const [liked, setLiked] = useState(false); 

  const handleLikeClick = async () => {
    try {
      await likeSong(trackId, accessToken); 
      setLiked(true); 
    } catch (error) {
      console.error("Fel vid gillande av låt:", error);
    }
  };

  return (
    <button
      className={`like-song-button ${liked ? "liked" : ""}`}
      onClick={handleLikeClick}
      disabled={liked} // Inaktivera knappen om låten redan är gillad
    >
      {liked ? "Gillad" : "Gilla låten"}
    </button>
  );
};

export default LikeSongButton;
