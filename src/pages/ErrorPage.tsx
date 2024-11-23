import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate("/"); 
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#121212",
        color: "#e0e0e0",
        fontFamily: "'Arial', sans-serif",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        Oops! Något gick fel.
      </h1>
      <p
        style={{
          fontSize: "1rem",
          marginBottom: "20px",
        }}
      >
        Vi kunde inte behandla din begäran. Försök igen.
      </p>
      <button
        onClick={handleRetry}
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          fontWeight: "bold",
          color: "#121212",
          backgroundColor: "#17a74e",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        onMouseOver={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1.1)";
        }}
        onMouseOut={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        Försök igen
      </button>
    </div>
  );
};

export default ErrorPage;
