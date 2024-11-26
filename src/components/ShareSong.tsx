import React from 'react';

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    alert('Länken har kopierats!');
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
          <img src="/facebook.png" alt="Dela på Facebook" className="icon" />
        </a>

        {/* Kopiera länk */}
        <button onClick={handleCopyLink} className="copy-link-button">
          <img src="/copy.png" alt="Kopiera länk" className="icon" />
        </button>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-button"
        >
          <img src="/instagram.png" alt="Dela på Instagram" className="icon" />
        </a>

        {/* Dela via mobil (Web Share API) */}
        <button onClick={handleWebShare} className="mobile-share-button">
          <img src="/share.png" alt="Dela via mobil" className="icon" />
        </button>
      </div>
    </div>
  );
};

export default ShareSong;
