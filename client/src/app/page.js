import FaceRecognition from "@/components/FaceRecongnition";
import LocationTracker from "@/components/GeoLocation";
import HomePage from "@/components/HomePage";

export default function Home() {
  const userId = "64f000000000000000000001";
  return (
    <>
      <HomePage userId={userId} />
      <FaceRecognition userId={userId} />
      <LocationTracker userId={userId} />
    </>
  );
}
