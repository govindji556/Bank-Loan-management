import React, { useState } from "react";

function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="collapsible">
      <div 
        className="collapsible-header"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span style={{ 
          transition: 'transform 0.3s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block'
        }}>
          ▼
        </span>
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
