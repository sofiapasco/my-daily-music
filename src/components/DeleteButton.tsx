import React from 'react'; 

interface DeleteButtonProps {
  songId: string;
  onDelete: (songId: string) => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ songId, onDelete }) => {
  return (
    <img
      src="/recycle-bin.png"
      alt="Delete song"
      onClick={() => onDelete(songId)}
      style={{
        width: '30px',
        height: '30px',
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

export default DeleteButton;
