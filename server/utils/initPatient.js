// utils/initPatient.js
import { Patient } from "../src/models/memoryVault.js"; // adjust path
import { DEFAULT_PATIENT_ID } from "../constants/patient.js";

export const initDefaultPatient = async () => {
  try {
    // Check if patient exists
    const existingPatient = await Patient.findById(DEFAULT_PATIENT_ID);

    if (existingPatient) {
      console.log("✅ Default patient already exists");
      return existingPatient;
    }

    // Create new blank patient
    const newPatient = await Patient.create({
      _id: DEFAULT_PATIENT_ID,
      name: "Default Patient",
      age: null,
      notes: "",
      location: {
        type: "Point",
        coordinates: [0, 0],
        lastUpdated: null,
      },
    });

    console.log("🆕 Default patient created");
    return newPatient;
  } catch (error) {
    console.error("❌ Error initializing default patient:", error);
  }
};
