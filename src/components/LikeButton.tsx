import React from 'react';
import { Song } from '../types/Song';

interface LikeButtonProps {
  song: Song;
  onLike: (song: Song) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ song, onLike }) => {
  return (
    <img
      src="/heart.png" // Ange korrekt sökväg till din bild
      alt="Like song"
      onClick={() => onLike(song)}
      style={{
        width: '34px',
        height: '34px',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
      }}
    />
  );
};

export default LikeButton;
