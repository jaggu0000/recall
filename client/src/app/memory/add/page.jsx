import PatientForm from "@/components/PatientForm";

import LocationTracker from "@/components/GeoLocation";

export default function Home() {
  return (
    <>
      <PatientForm />
      {/* <FaceRecognition /> */}
      <LocationTracker />
    </>
  );
}
