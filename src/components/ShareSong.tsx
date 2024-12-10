import React from 'react';
import { toast } from "react-toastify";

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

  const shareText = `Lyssna på "${title}" av ${artist}!`;
  const shareUrl = link; // Använd det redan existerande `link` från props

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

  return (
    <div className="share-song">
      <div className="social-buttons">
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="facebook-button"
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
      </div>
    </div>
  );
};

export default ShareSong;
