import { useState } from 'react';

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

      {/* Dropdown-menyn */}
      <div className={`user-dropdown ${isDropdownOpen ? '' : 'hidden'}`}>
        <a href="/profile">Profil</a>
        <a href="/daily-song">Dagens låt</a>
        <a href="/saved-songs">Sparade låtar</a>
        <a href="/statistics">Statistik</a>
      </div>
    </div>
  );
};

export default UserMenu;
