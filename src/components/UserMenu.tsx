import { useState } from 'react';
import '../assets/App.scss'; 

const UserMenu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="profile-menu">
      {/* Profilknapp */}
      <button className="user-button" onClick={toggleDropdown}>
        <img src="/user.png" alt="User" style={{ width: '100%', borderRadius: '50%' }} />
      </button>

      <div className={`user-dropdown ${isDropdownOpen ? '' : 'hidden'}`}>
        <a href="/saved-songs">Sparade låtar</a>
        <a href="/statistics">Statistik</a>
        <a href="/profile">Profil</a>
      </div>
    </div>
  );
};

export default UserMenu;
