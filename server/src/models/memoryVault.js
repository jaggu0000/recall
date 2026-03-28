import mongoose from "mongoose";

const { Schema } = mongoose;

// ─────────────────────────────────────────────
// Sub-schema: Individual Memory Entry
// Used inside both PersonEntry and TextEntry
// ─────────────────────────────────────────────
const MemorySchema = new Schema(
	{
		memory: {
			type: String,
			required: true,
			trim: true,
		},
		memory_priority: {
			type: Number,
			default: 1,
			min: 1,
			max: 5, // 1 = lowest priority, 5 = highest (shown first)
		},
		tags: {
			type: [String],
			default: [],
			// e.g. ["birthday", "family", "wedding"]
		},
		// Vector embedding of this memory (for semantic search)
		embedding: {
			type: [Number],
			default: [],
			// Store the vector here after generating from your embedding model
		},
	},
	{
		timestamps: {
			createdAt: "time_created",
			updatedAt: "time_updated",
		},
	},
);

// ─────────────────────────────────────────────
// Sub-schema: Person Entry
// For a relative or close one, with face images
// ─────────────────────────────────────────────
const PersonDataSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	age: {
		type: Number,
		min: 0,
	},
	relation: {
		type: String,
		required: true,
		enum: ["spouse", "child", "parent", "sibling", "grandchild", "grandparent", "friend", "caregiver", "other"],
	},
	// For demo: local file paths. For production: Cloudinary URLs
	images: {
		type: [String],
		default: [],
		// Each string is a path/URL to a face image for recognition
	},
	// General bio / description of this person
	// Used as context for the AI (e.g. "Anjali is my daughter who lives in Bangalore")
	text: {
		type: String,
		trim: true,
		default: "",
	},
	person_priority: {
		type: Number,
		default: 1,
		min: 1,
		max: 10, // Higher priority people are surfaced first in responses
	},
	memories: {
		type: [MemorySchema],
		default: [],
	},
	// Vector embedding of this person's overall profile (name + relation + bio)
	// Used for fast semantic lookup when a patient mentions someone
	embedding: {
		type: [Number],
		default: [],
	},
});

// ─────────────────────────────────────────────
// Sub-schema: Text Entry
// The patient's own personal data and memories
// e.g. "My trip to Munnar", "My favourite song", life story entries
// ─────────────────────────────────────────────
const TextDataSchema = new Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		// e.g. "Trip to Munnar", "First day at school"
	},
	// The main memory/event description
	text: {
		type: String,
		required: true,
		trim: true,
	},
	// Optional image(s) associated with the event/memory
	images: {
		type: [String],
		default: [],
	},
	person_priority: {
		type: Number,
		default: 1,
		min: 1,
		max: 10,
	},
	tags: {
		type: [String],
		default: [],
		// e.g. ["vacation", "nature", "favourite"]
	},
	// Individual sub-memories within this event (optional)
	memories: {
		type: [MemorySchema],
		default: [],
	},
	// Vector embedding of this text entry
	embedding: {
		type: [Number],
		default: [],
	},
});

// ─────────────────────────────────────────────
// Main Schema: Memory Vault Entry
// Top-level document, discriminated by `type`
// ─────────────────────────────────────────────
const MemoryVaultSchema = new Schema(
	{
		// Which patient does this memory belong to?
		patientId: {
			type: Schema.Types.ObjectId,
			ref: "Patient",
			required: true,
			index: true,
		},

		type: {
			type: String,
			required: true,
			enum: ["person", "text"],
			// "person" → a relative/close one (has images for face recognition)
			// "text"   → the patient's own personal data and memories
		},

		// Only one of these will be populated depending on `type`
		personData: {
			type: PersonDataSchema,
			default: null,
		},
		textData: {
			type: TextDataSchema,
			default: null,
		},

		// Added by: family member, caregiver, or the patient themselves
		addedBy: {
			type: String,
			enum: ["family", "caregiver", "patient"],
			default: "family",
		},
	},
	{
		timestamps: true, // createdAt, updatedAt on the top-level document
	},
);

// ─────────────────────────────────────────────
// Patient Schema
// The dementia patient whose memories are stored
// ─────────────────────────────────────────────
const PatientSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		age: {
			type: Number,
		},
		// Optional: a short note about the patient (their preferences, tone, etc.)
		notes: {
			type: String,
			default: "",
		},
		// The caregiver/family account that manages this patient
		managedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	},
);

// ─────────────────────────────────────────────
// User Schema
// The caregiver or family member who manages the Memory Vault
// ─────────────────────────────────────────────
const UserSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		passwordHash: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ["caregiver", "family", "patient"],
			default: "family",
		},
		patients: [
			{
				type: Schema.Types.ObjectId,
				ref: "Patient",
			},
		],
	},
	{
		timestamps: true,
	},
);

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────

// Fast lookup of all memory vault entries for a patient
MemoryVaultSchema.index({ patientId: 1, type: 1 });

// Fast lookup of high-priority persons (for face recognition hit list)
MemoryVaultSchema.index({ patientId: 1, "personData.person_priority": -1 });

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────
export const MemoryVault = mongoose.model("MemoryVault", MemoryVaultSchema);
export const Patient = mongoose.model("Patient", PatientSchema);
export const User = mongoose.model("User", UserSchema);
