import React, { useState, useEffect } from "react";
import { apiGet, apiPut } from "../services/apiService.js";

export default function NotificationsList({ userRole, onNotificationRemoved }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/notifications/unread");
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiPut(`/notifications/${notificationId}/read`, {});
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Callback to parent to refresh data if needed
      if (onNotificationRemoved) {
        onNotificationRemoved();
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const getStatusBadge = (message) => {
    if (message.includes("APPROVED")) {
      return <span className="status-badge status-approved">✓ APPROVED</span>;
    } else if (message.includes("REJECTED")) {
      return <span className="status-badge status-rejected">✗ REJECTED</span>;
    } else if (message.includes("pending") || message.includes("submitted")) {
      return <span className="status-badge status-pending">⏳ PENDING</span>;
    }
    return null;
  };

  if (loading && notifications.length === 0) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>Loading...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div style={{
        padding: "20px",
        textAlign: "center",
        color: "#999",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        margin: "10px 0"
      }}>
        No notifications
      </div>
    );
  }

  return (
    <div className="notifications-list">
      <h3 style={{ marginBottom: "15px" }}>
        📬 Notifications ({notifications.length})
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="notification-item"
            style={{
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onClick={() => setExpandedId(expandedId === notif.id ? null : notif.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                    {notif.message.split(" - ")[0]}
                  </span>
                  {getStatusBadge(notif.message)}
                </div>
                
                {expandedId === notif.id && (
                  <div style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "6px",
                    fontSize: "13px",
                    color: "#555",
                    lineHeight: "1.5"
                  }}>
                    <p style={{ margin: "0 0 8px 0" }}>{notif.message}</p>
                    <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <button
                className="btn-mark-read"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(notif.id);
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
              >
                Mark as Read
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
