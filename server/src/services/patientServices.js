import { Patient } from "../models/memoryVault.js";

// ─────────────────────────────────────────────
// Update the live location of a patient
// Receives latitude and longitude, stores as
// GeoJSON [longitude, latitude] in coordinates
// ─────────────────────────────────────────────
export const updateLocation = async (patientId, latitude, longitude) => {
	const patient = await Patient.findByIdAndUpdate(
		patientId,
		{
			location: {
				type: "Point",
				coordinates: [longitude, latitude], // GeoJSON order: [lng, lat]
				lastUpdated: new Date(),
			},
		},
		{ new: true }, // return the updated document
	);

	return patient;
};
