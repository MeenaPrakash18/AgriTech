import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export const NotificationProvider = ({ children }) => {
  // 1. Notification History State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('agritech_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. User Alert Preferences State
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('agritech_alert_prefs');
    return saved ? JSON.parse(saved) : {
      pushEnabled: false,
      smsEnabled: false,
      weather: true,
      market: true,
      schemes: true,
      diseases: true
    };
  });

  // Keep ref of latest state to prevent stale closures in setInterval
  const prefsRef = useRef(preferences);
  useEffect(() => { prefsRef.current = preferences; }, [preferences]);

  // Persist notifications memory
  useEffect(() => {
    localStorage.setItem('agritech_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('agritech_alert_prefs', JSON.stringify(preferences));
  }, [preferences]);

  const togglePreference = (key) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // Request Web Push permission instantly if turning on Push!
      if (key === 'pushEnabled' && updated.pushEnabled) {
        if ("Notification" in window) {
          Notification.requestPermission().then(permission => {
            if (permission !== "granted") {
              setPreferences(p => ({ ...p, pushEnabled: false })); // Revert if denied
              alert("You must allow notifications in your browser settings to receive Push Alerts.");
            }
          });
        }
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setNotifications([]);
  };

  /**
   * Primary Dispatcher: The Core Engine
   * @param {string} title 
   * @param {string} msg 
   * @param {string} type 'weather' | 'market' | 'scheme' | 'disease'
   * @param {string} priority 'HIGH' | 'MEDIUM' | 'LOW'
   */
  const triggerAlert = async (title, msg, type, priority, iconClass, cardColor) => {
    // 1. Enforce User Category Preferences
    if (type === 'weather' && !prefsRef.current.weather) return;
    if (type === 'market' && !prefsRef.current.market) return;
    if (type === 'scheme' && !prefsRef.current.schemes) return;
    if (type === 'disease' && !prefsRef.current.diseases) return;

    // 2. Construct Notification Object
    const alertData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      title,
      msg,
      type,
      priority,
      iconClass: iconClass || 'bi-bell-fill',
      cardColor: cardColor || 'info'
    };

    // 3. Save to History (prepend)
    setNotifications(prev => [alertData, ...prev]);

    // 4. Trigger HTML5 Native Push Notification
    if (prefsRef.current.pushEnabled && "Notification" in window && Notification.permission === "granted") {
      new Notification(`AgriTech: ${title}`, {
        body: msg,
        icon: '/favicon.ico' // Or any logo path
      });
    }

    // 5. Trigger Backend SMS Engine for High Priority Alerts
    if (prefsRef.current.smsEnabled && priority === 'HIGH') {
      const farmerPhone = localStorage.getItem('agritech_farmer_phone');
      if (farmerPhone) {
        console.log(`[NotificationContext] Dispatching HIGH priority SMS to ${farmerPhone}`);
        const apiBase = `http://${window.location.hostname}:5000/api/send-alert-sms`;
        try {
           axios.post(apiBase, {
            phone: farmerPhone,
            title: title,
            msg: msg
          }).then(res => {
            console.log("[NotificationContext] SMS Backend Response:", res.data);
          }).catch(e => console.error("[NotificationContext] SMS Failed", e));
        } catch(e){
          console.error("[NotificationContext] SMS Trigger Error:", e);
        }
      } else {
        console.warn("[NotificationContext] SMS Enabled but no phone number linked in localStorage.");
      }
    }
  };

  /**
   * Manual Alert Dispatcher: Bypasses preferences for explicit User and Link events
   * @param {string} title 
   * @param {string} msg 
   */
  const sendManualAlert = async (title, msg) => {
    const farmerPhone = localStorage.getItem('agritech_farmer_phone');
    if (!farmerPhone) {
      console.warn("[NotificationContext] No phone number linked for manual alert.");
      return { success: false, error: "No phone number linked." };
    }

    console.log(`[NotificationContext] Manual SMS request to ${farmerPhone}`);
    const apiBase = `http://${window.location.hostname}:5000/api/send-alert-sms`;
    try {
      const res = await axios.post(apiBase, {
        phone: farmerPhone,
        title: title,
        msg: msg
      });
      return { success: true, data: res.data };
    } catch (e) {
      console.error("[NotificationContext] Manual SMS failed", e);
      return { success: false, error: "Gateway failure." };
    }
  };

  // -------------------------------------------------------------
  // SIMULATOR: Real-Time Event Generators (runs every 60s)
  // -------------------------------------------------------------
  useEffect(() => {
    // Only run simulator if the user hasn't toggled off basic alerts
    const simulatorId = setInterval(() => {
      const random = Math.random();
      
      // 30% chance of a Weather Alert
      if (random < 0.3) {
        triggerAlert(
          "Heavy Rain Expected",
          "35mm rainfall predicted in your area within 4 hours. Delay pesticide application.",
          "weather",
          "HIGH",
          "bi-cloud-rain-heavy-fill",
          "warning"
        );
      } 
      // 20% chance of a Market Alert
      else if (random < 0.5) {
        triggerAlert(
          "Tomato Prices High",
          "Mandi prices for Tomato surged by ₹300/quintal in the last hour. Good time to sell.",
          "market",
          "MEDIUM",
          "bi-graph-up-arrow",
          "success"
        );
      }
      // 10% chance of a Govt Scheme Alert
      else if (random < 0.6) {
        triggerAlert(
          "New Subsidy Announced",
          "PM-KISAN application window just opened for the Rabi season. Apply now.",
          "scheme",
          "LOW",
          "bi-bank2",
          "info"
        );
      }
    }, 60000); // 60 seconds

    return () => clearInterval(simulatorId);
  }, []); // Run once on mount

  return (
    <NotificationContext.Provider value={{
      notifications,
      preferences,
      togglePreference,
      clearHistory,
      triggerAlert,
      sendManualAlert
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
