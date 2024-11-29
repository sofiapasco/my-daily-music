import React from "react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null; 

  const handleClick = (page: number) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handleClick(i)}
          style={{
            margin: "0 5px",
            padding: "5px 10px",
            backgroundColor: i === currentPage ? "#922692" : "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <button 
        onClick={() => handleClick(currentPage - 1)} 
        disabled={currentPage === 1}
        style={{
          padding: "5px 10px",
          marginRight: "10px",
          backgroundColor: currentPage === 1 ? "#e0e0e0" : "#f0f0f0",
          border: "1px solid #ccc",
          borderRadius: "5px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        Föregående
      </button>
      {renderPageNumbers()}
      <button 
        onClick={() => handleClick(currentPage + 1)} 
        disabled={currentPage === totalPages}
        style={{
          padding: "5px 10px",
          marginLeft: "10px",
          backgroundColor: currentPage === totalPages ? "#e0e0e0" : "#f0f0f0",
          border: "1px solid #ccc",
          borderRadius: "5px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        Nästa
      </button>
    </div>
  );
};

export default Pagination;
