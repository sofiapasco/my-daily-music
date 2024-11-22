import React from "react";
import { Song } from "../types/Song";
import { toast } from "react-toastify";

interface LikeButtonProps {
  currentSong: Song | null;
  likedSongs: Song[];
  setLikedSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ currentSong, likedSongs, setLikedSongs, className }) => {
  const handleClick = () => {
    if (currentSong) {
      const isAlreadyLiked = likedSongs.some((song) => song.id === currentSong.id);

      if (!isAlreadyLiked) {
        setLikedSongs((prevSongs) => [...prevSongs, currentSong]);
        toast.success(`${currentSong.name} har lagts till i dina gillade låtar!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.info("Den här låten är redan gillad.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  return (
    <img
      src="/heart.png"
      alt="Gilla låten"
      className={className}
      onClick={handleClick}
    />
  );
};

export default LikeButton;
