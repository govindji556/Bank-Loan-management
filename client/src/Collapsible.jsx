import React, { useState } from "react";

function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="collapsible-container">
      <div 
        className="collapsible-header"
        onClick={() => setOpen(!open)}
      >
        {title}
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
}

export default Collapsible;
