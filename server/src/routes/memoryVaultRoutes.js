import express from "express";
import {
	getAllEntries,
	getPersonEntries,
	getTextEntries,
	getEntryById,
	createEntry,
	addMemoryToEntry,
	deleteEntry,
} from "../controllers/memoryVaultController.js";

const router = express.Router();

// ─────────────────────────────────────────────
// All entries for a patient
// ─────────────────────────────────────────────
router.get("/:patientId", getAllEntries);

// ─────────────────────────────────────────────
// Person entries only (for face recognition)
// ─────────────────────────────────────────────
router.get("/:patientId/persons", getPersonEntries);

// ─────────────────────────────────────────────
// Patient's own personal text entries
// ─────────────────────────────────────────────
router.get("/:patientId/texts", getTextEntries);

// ─────────────────────────────────────────────
// Single entry by ID
// ─────────────────────────────────────────────
router.get("/entry/:id", getEntryById);

// ─────────────────────────────────────────────
// Create a new memory vault entry
// ─────────────────────────────────────────────
router.post("/", createEntry);

// ─────────────────────────────────────────────
// Add a memory to an existing entry
// ─────────────────────────────────────────────
router.post("/:id/memories", addMemoryToEntry);

// ─────────────────────────────────────────────
// Delete an entry
// ─────────────────────────────────────────────
router.delete("/:id", deleteEntry);

export default router;
