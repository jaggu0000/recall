"use client";

import { useEffect } from "react";

export default function LocationTracker({
  userId = "64f000000000000000000001",
}) {
  // 📍 Get location
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
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

        const { latitude, longitude } = await getLocation();

        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${userId}/location`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude,
              longitude,
            }),
          },
        );

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
