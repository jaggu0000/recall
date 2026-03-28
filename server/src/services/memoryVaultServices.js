import { MemoryVault } from "../models/memoryVault.js";

// ─────────────────────────────────────────────
// Get all entries for a patient
// ─────────────────────────────────────────────
export const fetchAllEntries = async (patientId) => {
	return await MemoryVault.find({ patientId }).sort({ createdAt: -1 });
};

// ─────────────────────────────────────────────
// Get only person entries for a patient
// Sorted by person_priority descending (highest first)
// ─────────────────────────────────────────────
export const fetchPersonEntries = async (patientId) => {
	return await MemoryVault.find({ patientId, type: "person" }).sort({
		"personData.person_priority": -1,
	});
};

// ─────────────────────────────────────────────
// Get only the patient's own text entries
// Sorted by person_priority descending
// ─────────────────────────────────────────────
export const fetchTextEntries = async (patientId) => {
	return await MemoryVault.find({ patientId, type: "text" }).sort({
		"textData.person_priority": -1,
	});
};

// ─────────────────────────────────────────────
// Get a single entry by its MongoDB ID
// ─────────────────────────────────────────────
export const fetchEntryById = async (id) => {
	return await MemoryVault.findById(id);
};

// ─────────────────────────────────────────────
// Create a new memory vault entry
// ─────────────────────────────────────────────
export const createVaultEntry = async ({ patientId, type, personData, textData, addedBy }) => {
	return await MemoryVault.create({
		patientId,
		type,
		personData: type === "person" ? personData : null,
		textData: type === "text" ? textData : null,
		addedBy,
	});
};

// ─────────────────────────────────────────────
// Add a memory sub-document to an existing entry
// ─────────────────────────────────────────────
export const addMemory = async (id, memoryData) => {
	const entry = await MemoryVault.findById(id);

	if (!entry) return null;

	if (entry.type === "person") {
		entry.personData.memories.push(memoryData);
	} else {
		entry.textData.memories.push(memoryData);
	}

	return await entry.save();
};

// ─────────────────────────────────────────────
// Delete an entry by ID
// ─────────────────────────────────────────────
export const deleteVaultEntry = async (id) => {
	return await MemoryVault.findByIdAndDelete(id);
};
