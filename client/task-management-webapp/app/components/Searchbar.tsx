import React, { useState } from "react";

interface SearchbarProps {
  onSearch: (term: string) => void;
}

const Searchbar: React.FC<SearchbarProps> = ({ onSearch }) => {
  const [input, setInput] = useState("");

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <input
  type="text"
  placeholder="Search tasks..."
  value={input}
  onChange={(e) => {
    const value = e.target.value;
    setInput(value);
    onSearch(value);
  }}
  style={{
    backgroundColor: "black",  // 👈 add this
    color: "white",            // 👈 ensures text is readable
    padding: "10px",
    fontSize: "16px",
    border: "3px solid white",
    borderRadius: "4px",
    width: "100%",
  }}
/>
    </div>
  );
};

export default Searchbar;
