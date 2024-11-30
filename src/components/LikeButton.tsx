import React from "react";
import { Track } from "../types/Song";

interface LikeButtonProps {
  song: Track;
  onLike: (song: Track, event: React.MouseEvent<HTMLImageElement, MouseEvent>) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ song, onLike }) => {
  return (
    <img
      src="/heart1.png"
      alt="Like song"
      className="like-heart"
      onClick={(e) => onLike(song, e)} // Passerar både song och event
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLImageElement).style.transform = "scale(1.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
      }}
    />
  );
};

export default LikeButton;
