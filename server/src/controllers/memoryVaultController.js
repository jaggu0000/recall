import {
	fetchAllEntries,
	fetchPersonEntries,
	fetchTextEntries,
	fetchEntryById,
	createVaultEntry,
	addMemory,
	deleteVaultEntry,
} from "../services/memoryVaultServices.js";

// ─────────────────────────────────────────────
// GET /:patientId
// ─────────────────────────────────────────────
export const getAllEntries = async (req, res) => {
	try {
		const entries = await fetchAllEntries(req.params.patientId);
		res.status(200).json({ success: true, count: entries.length, data: entries });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// ─────────────────────────────────────────────
// GET /:patientId/persons
// ─────────────────────────────────────────────
export const getPersonEntries = async (req, res) => {
	try {
		const entries = await fetchPersonEntries(req.params.patientId);
		res.status(200).json({ success: true, count: entries.length, data: entries });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// ─────────────────────────────────────────────
// GET /:patientId/texts
// ─────────────────────────────────────────────
export const getTextEntries = async (req, res) => {
	try {
		const entries = await fetchTextEntries(req.params.patientId);
		res.status(200).json({ success: true, count: entries.length, data: entries });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// ─────────────────────────────────────────────
// GET /entry/:id
// ─────────────────────────────────────────────
export const getEntryById = async (req, res) => {
	try {
		const entry = await fetchEntryById(req.params.id);

		if (!entry) {
			return res.status(404).json({ success: false, message: "Entry not found" });
		}

		res.status(200).json({ success: true, data: entry });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// ─────────────────────────────────────────────
// POST /
// Body: { patientId, type, personData | textData, addedBy }
// ─────────────────────────────────────────────
export const createEntry = async (req, res) => {
	try {
		const { patientId, type, personData, textData, addedBy } = req.body;

		if (type === "person" && !personData) {
			return res.status(400).json({
				success: false,
				message: "personData is required when type is 'person'",
			});
		}

		if (type === "text" && !textData) {
			return res.status(400).json({
				success: false,
				message: "textData is required when type is 'text'",
			});
		}

		const entry = await createVaultEntry({ patientId, type, personData, textData, addedBy });
		res.status(201).json({ success: true, data: entry });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// ─────────────────────────────────────────────
// POST /:id/memories
// Body: { memory, memory_priority, tags }
// ─────────────────────────────────────────────
export const addMemoryToEntry = async (req, res) => {
	try {
		const entry = await addMemory(req.params.id, req.body);

		if (!entry) {
			return res.status(404).json({ success: false, message: "Entry not found" });
		}

		res.status(201).json({ success: true, data: entry });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// ─────────────────────────────────────────────
// DELETE /:id
// ─────────────────────────────────────────────
export const deleteEntry = async (req, res) => {
	try {
		const entry = await deleteVaultEntry(req.params.id);

		if (!entry) {
			return res.status(404).json({ success: false, message: "Entry not found" });
		}

		res.status(200).json({ success: true, message: "Entry deleted successfully" });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
