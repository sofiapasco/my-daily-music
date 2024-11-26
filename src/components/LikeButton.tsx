import React from 'react';
import { Track } from '../types/Song';

interface LikeButtonProps {
  song: Track;
  onLike: (song: Track) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ song, onLike }) => {
  return (
    <img
      src="/heart.png" 
      alt="Like song"
      className='like-heart'
      onClick={() => onLike(song)}

      
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
