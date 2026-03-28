"use client";

import { useEffect } from "react";

export default function LocationTracker({ userId = "patient-1" }) {
  // 📍 Get location
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true },
      );
    });
  };

  useEffect(() => {
    const sendLocation = async () => {
      try {
        if (!navigator.onLine) return;

        const location = await getLocation();

        console.log(location, "location");

        // await fetch("http://localhost:5000/api/location", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     userId,
        //     location,
        //     timestamp: new Date(),
        //   }),
        // });

        console.log("📍 Location sent:", location);
      } catch (err) {
        console.error("Location error:", err);
      }
    };

    // ⏱️ interval
    const interval = setInterval(sendLocation, 300000); // 30 sec

    // send immediately once
    sendLocation();

    return () => clearInterval(interval);
  }, [userId]);

  return null; // no UI
}
