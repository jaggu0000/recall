import PatientForm from "@/components/PatientForm";


import FaceRecognition from "@/components/FaceRecongnition";

import LocationTracker from "@/components/GeoLocation";

export default function Home() {
  return (
    <>
    <PatientForm />
      <FaceRecognition />
      <LocationTracker />
    </>
  );
}
