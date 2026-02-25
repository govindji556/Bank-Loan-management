import { useState, useEffect, useRef } from "react";
import { apiGet } from "../services/apiService.js";

/**
 * Custom hook for polling unread notifications
 * Uses /notifications/unread endpoint
 */

export function useNotificationPolling(pollInterval = 10000) {
  const [notifications, setNotifications] = useState([]);
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await apiGet("/notifications/unread");
        
        if (!Array.isArray(data)) return;

        const newNotifications = [];

        // Check for new notification IDs we haven't displayed yet
        data.forEach(notif => {
          if (!seenIdsRef.current.has(notif.id)) {
            seenIdsRef.current.add(notif.id);
            
            // Determine status from message content
            let status = "pending";
            if (notif.message.includes("APPROVED")) {
              status = "approved";
            } else if (notif.message.includes("REJECTED")) {
              status = "rejected";
            }

            newNotifications.push({
              id: notif.id,
              message: notif.message,
              status: status,
              timestamp: new Date(notif.created_at),
            });
          }
        });

        if (newNotifications.length > 0) {
          newNotifications.forEach(n => setNotifications(prev => [...prev, n]));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const interval = setInterval(poll, pollInterval);
    poll(); // Initial call

    return () => clearInterval(interval);
  }, [pollInterval]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, removeNotification };
}
