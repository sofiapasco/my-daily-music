import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    if (token) {
      setAccessToken(token);
      localStorage.setItem("spotifyAccessToken", token);
      navigate("/mood-selection");
    } else {
      console.error("Ingen access-token hittades");
    }
    window.location.hash = "";
  }, [navigate,setAccessToken]);

  return <span className="loader"></span> 
};

export default Callback;
