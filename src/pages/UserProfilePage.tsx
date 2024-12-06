import React from "react";
import UserProfile from "../components/UserProfile";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../context/AuthContext";

const UserPage: React.FC = () => {
    const { logout } = useAuth();


    const handleLogout = () => {
        localStorage.removeItem("spotifyAccessToken");
        logout();
      };
    
      return (
        <div className="user-page-container" style={{height: "100vh"}}>
          <div className="header">
  
            <UserMenu />
            <button className="logout-btn" onClick={handleLogout}>
              Logga ut
            </button>
          </div>
          <div className="user-page">
            <UserProfile />
          </div>
        </div>
      );
      };
      
      export default UserPage;
      
