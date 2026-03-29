import FaceRecognition from "@/components/FaceRecongnition";
import LocationTracker from "@/components/GeoLocation";
import HomePage from "@/components/HomePage";

export default function Home() {
  return (
    <>
      <HomePage />
      <FaceRecognition />
      <LocationTracker />
    </>
  );
}
