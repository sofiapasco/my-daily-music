import React from "react";

interface ProgressBarProps {
  currentTime: string;
  duration: string;
  progress: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  progress,
  onSeek,
}) => {
  return (
    <div className="progress-container">
      <span className="current-time">{currentTime}</span>
      <div className="progress-bar" onClick={onSeek}>
        <div className="progress" style={{ width: `${progress}%` }}>
          <div className="progress-knob"></div>
        </div>
      </div>
      <span className="duration">{duration}</span>
    </div>
  );
};

export default ProgressBar;
