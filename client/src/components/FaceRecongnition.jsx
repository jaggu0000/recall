"use client";

/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import memoryDB from "@/app/data/memoryDB";

export default function FaceRecognition() {
  const videoRef = useRef(null);
  const lastSpoken = useRef("");
  const [message, setMessage] = useState("Loading models...");

  // 🎥 Start webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch(() => setMessage("Camera access denied"));
  };

  // 🚀 Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      console.log("✅ Models loaded");

      startVideo();
    };

    loadModels();
  }, []);

  // 🧠 Convert memoryDB → descriptors
  const loadMemoryDescriptors = async () => {
    const labeledDescriptors = [];

    for (const item of memoryDB) {
      if (item.type !== "person") continue;

      const { name, images } = item.data;
      const descriptors = [];

      for (const imgPath of images) {
        try {
          const img = await faceapi.fetchImage(imgPath);

          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) descriptors.push(detection.descriptor);
        } catch (err) {
          console.warn("Error loading image:", imgPath);
        }
      }

      if (descriptors.length > 0) {
        labeledDescriptors.push(
          new faceapi.LabeledFaceDescriptors(name, descriptors),
        );
      }
    }

    return labeledDescriptors;
  };

  // 🔁 Main detection loop
  const handleVideoPlay = async () => {
    const labeledDescriptors = await loadMemoryDescriptors();

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

    const detect = async () => {
      if (!videoRef.current) return;

      const detections = await faceapi
        .detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        setMessage("No face detected");
        lastSpoken.current = "";
      } else {
        const results = detections.map((d) =>
          faceMatcher.findBestMatch(d.descriptor),
        );

        // 🔹 Remove duplicates + sort by confidence
        const uniqueResults = [];
        results.forEach((r) => {
          if (
            r.label !== "unknown" &&
            r.distance < 0.6 &&
            !uniqueResults.find((u) => u.label === r.label)
          ) {
            uniqueResults.push(r);
          }
        });

        const peopleTexts = [];

        uniqueResults.forEach((result) => {
          const name = result.label;

          const personObj = memoryDB.find(
            (item) => item.type === "person" && item.data.name === name,
          );

          if (personObj) {
            const { relation, memories } = personObj.data;

            const topMemory = memories.sort(
              (a, b) => b.priority - a.priority,
            )[0];

            peopleTexts.push(`${name}, your ${relation}. ${topMemory.memory}`);
          }
        });

        let finalText = "";

        if (peopleTexts.length === 0) {
          finalText = "I don't recognize anyone";
        } else if (peopleTexts.length === 1) {
          finalText = `This is ${peopleTexts[0]}`;
        } else {
          finalText = `These are ${peopleTexts.join(" and ")}`;
        }

        setMessage(finalText);

        // 🔊 Speak once per result
        if (lastSpoken.current !== finalText) {
          lastSpoken.current = finalText;

          speechSynthesis.cancel();
          speechSynthesis.speak(new SpeechSynthesisUtterance(finalText));
        }
      }

      setTimeout(detect, 3000);
    };

    detect();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoPlay}
        className="rounded-xl w-[400px]"
      />

      <div className="mt-6 text-xl text-center max-w-md">{message}</div>
    </div>
  );
}
