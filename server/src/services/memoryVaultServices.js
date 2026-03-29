import { MemoryVault } from '../models/memoryVault.js'
import { generateEmbedding } from './ragService.js'

// ─────────────────────────────────────────────
// Get all entries for a patient
// ─────────────────────────────────────────────
export const fetchAllEntries = async (patientId) => {
	return await MemoryVault.find({ patientId }).sort({ createdAt: -1 })
}

// ─────────────────────────────────────────────
// Get only person entries for a patient
// ─────────────────────────────────────────────
export const fetchPersonEntries = async (patientId) => {
	return await MemoryVault.find({ patientId, type: 'person' }).sort({
		'personData.person_priority': -1,
	})
}

// ─────────────────────────────────────────────
// Get only text entries for a patient
// ─────────────────────────────────────────────
export const fetchTextEntries = async (patientId) => {
	return await MemoryVault.find({ patientId, type: 'text' }).sort({
		'textData.person_priority': -1,
	})
}

// ─────────────────────────────────────────────
// Get a single entry by MongoDB ID
// ─────────────────────────────────────────────
export const fetchEntryById = async (id) => {
	return await MemoryVault.findById(id)
}

// ─────────────────────────────────────────────
// Create a new memory vault entry
// Auto-generates embeddings for the text/person data
// ─────────────────────────────────────────────
export const createVaultEntry = async ({ patientId, type, personData, textData, addedBy }) => {
	if (type === 'person' && personData) {
		// Embed: name + relation + bio text
		const textToEmbed = `${personData.name} is the patient's ${personData.relation}. ${personData.text || ''}`
		personData.embedding = await generateEmbedding(textToEmbed)

		// Embed each individual memory if provided
		if (personData.memories?.length) {
			for (const mem of personData.memories) {
				if (mem.memory) {
					mem.embedding = await generateEmbedding(mem.memory)
				}
			}
		}
	}

	if (type === 'text' && textData) {
		// Embed: title + full text
		const textToEmbed = `${textData.title}. ${textData.text}`
		textData.embedding = await generateEmbedding(textToEmbed)

		// Embed each sub-memory if provided
		if (textData.memories?.length) {
			for (const mem of textData.memories) {
				if (mem.memory) {
					mem.embedding = await generateEmbedding(mem.memory)
				}
			}
		}
	}

	return await MemoryVault.create({
		patientId,
		type,
		personData: type === 'person' ? personData : null,
		textData: type === 'text' ? textData : null,
		addedBy,
	})
}

// ─────────────────────────────────────────────
// Add a memory sub-document to an existing entry
// Auto-generates embedding for the new memory
// ─────────────────────────────────────────────
export const addMemory = async (id, memoryData) => {
	const entry = await MemoryVault.findById(id)
	if (!entry) return null

	// Generate embedding for this memory
	if (memoryData.memory) {
		memoryData.embedding = await generateEmbedding(memoryData.memory)
	}

	if (entry.type === 'person') {
		entry.personData.memories.push(memoryData)
	} else {
		entry.textData.memories.push(memoryData)
	}

	return await entry.save()
}

// ─────────────────────────────────────────────
// Delete an entry by ID
// ─────────────────────────────────────────────
export const deleteVaultEntry = async (id) => {
	return await MemoryVault.findByIdAndDelete(id)
}
