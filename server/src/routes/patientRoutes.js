import express from "express";
import { updatePatientLocation } from "../controllers/patientController.js";

const router = express.Router();

// ─────────────────────────────────────────────
// PATCH /api/patients/:id/location
// Update the live location of a patient
// Body: { latitude, longitude }
// ─────────────────────────────────────────────
router.patch("/:id/location", updatePatientLocation);

export default router;
