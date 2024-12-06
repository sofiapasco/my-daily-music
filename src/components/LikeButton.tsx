import React from "react";
import { Track } from "../types/Song";

interface LikeButtonProps {
  song: Track;
  onLike: (song: Track, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ song, onLike }) => {
  return (
    <button
      className="like-heart"
      onClick={(e) => onLike(song, e)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="24"
        height="24"
        aria-hidden="true"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
};

export default LikeButton;
