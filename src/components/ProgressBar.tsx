import React from "react";

interface ProgressBarProps {
  currentTime: number; 
  duration: number; 
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration }) => {
  const progress = (currentTime / duration) * 100;

  return (
    <div style={{ width: "100%", marginTop: "10px" }}>
      <div
        style={{
          height: "10px",
          width: "100%",
          backgroundColor: "#e0e0e0",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            height: "10px",
            width: `${progress}%`,
            backgroundColor: "#6a0dad",
            borderRadius: "5px",
            transition: "width 0.5s ease",
          }}
        ></div>
      </div>
      <p style={{ fontSize: "12px", marginTop: "5px" }}>
        {Math.floor(currentTime / 60)}:
        {Math.floor(currentTime % 60).toString().padStart(2, "0")} /{" "}
        {Math.floor(duration / 60)}:
        {Math.floor(duration % 60).toString().padStart(2, "0")}
      </p>
    </div>
  );
};

export default ProgressBar;
