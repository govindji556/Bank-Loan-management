import React, { useEffect } from "react";

export default function NotificationToast({ notification, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getColors = (status) => {
    switch (status) {
      case "approved":
        return { bg: "#d4edda", text: "#155724" };
      case "rejected":
        return { bg: "#f8d7da", text: "#721c24" };
      case "pending":
        return { bg: "#fff3cd", text: "#856404" };
      default:
        return { bg: "#e7f3ff", text: "#004085" };
    }
  };

  const colors = getColors(notification.status);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        padding: "16px 20px",
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 10000,
        minWidth: 300,
        maxWidth: 400,
        animation: "slideIn 0.3s ease-out",
        border: `2px solid ${colors.text}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <strong>{notification.message}</strong>
          <div style={{ fontSize: "12px", marginTop: 4, opacity: 0.8 }}>
            {notification.timestamp?.toLocaleTimeString()}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            padding: 0,
            color: "inherit",
            minWidth: 24,
          }}
        >
          ×
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
