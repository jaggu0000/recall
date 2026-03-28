import { updateLocation } from "../services/patientServices.js";

// ─────────────────────────────────────────────
// PATCH /:id/location
// Body: { latitude, longitude }
// ─────────────────────────────────────────────
export const updatePatientLocation = async (req, res) => {
	try {
		const { id } = req.params;
		const { latitude, longitude } = req.body;

		if (latitude === undefined || longitude === undefined) {
			return res.status(400).json({
				success: false,
				message: "latitude and longitude are required",
			});
		}

		const patient = await updateLocation(id, latitude, longitude);

		if (!patient) {
			return res.status(404).json({
				success: false,
				message: "Patient not found",
			});
		}

		res.status(200).json({
			success: true,
			data: {
				patientId: patient._id,
				location: {
					latitude,
					longitude,
					lastUpdated: patient.location.lastUpdated,
				},
			},
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
