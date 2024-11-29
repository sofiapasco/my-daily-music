import React from "react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void; // Funktion för att trigga sökningen
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onSearch }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(); // Trigga sökningen när "Enter" trycks
    }
  };

  return (
    <div style={{ padding: "10px 0", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <input
        type="text"
        placeholder="Sök efter låtar eller artister..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)} 
        onKeyPress={handleKeyPress} 
        style={{
          padding: "10px",
          width: "80%",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid grey",
        }}
      />
      <button
        onClick={onSearch} 
        style={{
          padding: "10px 20px",
          marginLeft: "10px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#4caf50",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Sök
      </button>
    </div>
  );
};

export default SearchBar;

