// ─────────────────────────────────────────────
// RAG Service — OpenRouter + plain text context
// No embeddings. No vector DB. Works offline too.
// ─────────────────────────────────────────────

// Hardcoded demo context — used when DB is unavailable or empty
const DEMO_PATIENT_NAME = 'Rajan'
const DEMO_CONTEXT = `
Priya (daughter): Rajan's daughter. Lives in Bangalore. Works as a doctor. Visits every month.
  - Visited last Sunday and brought Rajan's favourite gulab jamun. They sat on the balcony and talked for hours.
  - On Rajan's 75th birthday, Priya flew in from Bangalore as a surprise. Rajan cried happy tears.
  - Priya used to sit on Rajan's lap and ask him to tell stories about his childhood in Kerala.

Arjun (grandson): Priya's son. 9 years old. Loves cricket just like Rajan.
  - Calls Rajan every evening before bed to say goodnight. Rajan loves this routine.
  - Rajan taught Arjun how to bowl a googly in the backyard last summer.
  - Arjun drew a portrait of Rajan for a school project called 'My Hero'. Rajan keeps it on his bedside table.

Meena (wife): Married 50 years. Passed away 3 years ago. Rajan misses her deeply.
  - Married in 1975 in a temple in Thrissur, Kerala. It was a beautiful monsoon day.
  - Meena made Rajan's favourite sambar every Friday. The whole house would smell wonderful.
  - Every evening Rajan and Meena walked in the garden and listened to old Kishore Kumar songs.

Suresh (brother): Rajan's younger brother. Lives in Kochi. Calls every weekend.
  - Rajan and Suresh grew up near Chalakudy river. They used to fish together every morning.
  - They used to watch cricket on a neighbour's black and white TV as children.

Trip to Munnar (2010): Family trip with Meena, Priya, and little Arjun who was 3 years old.
  - Rajan and Meena had tea at a hillside shop overlooking the tea gardens. Best tea of their lives.
  - Little Arjun ran through the tea gardens and Rajan chased him laughing. Priya took a photo.

Career: Rajan was a school headmaster in Thrissur for 35 years. Retired in 2008. Loved by all students.
  - Many former students still visit Rajan during Onam and Vishu every year.
  - Received a gold medal from the state education department in 1998.

Hobbies: Rajan loves cricket. Favourite player is Sunil Gavaskar. Never misses an India match.
  - Listened to the 1983 World Cup final on a transistor radio. Was overjoyed when India won.
`.trim()

// ─────────────────────────────────────────────
// Build plain text context from MongoDB
// Falls back to hardcoded demo if DB fails
// ─────────────────────────────────────────────
const buildContextFromDB = async (patientId) => {
	// Lazy import — won't crash if mongoose not connected
	const { MemoryVault } = await import('../models/memoryVault.js')
	const entries = await MemoryVault.find({ patientId }).lean()
	if (!entries.length) return null

	let context = ''
	for (const entry of entries) {
		if (entry.type === 'person' && entry.personData) {
			const p = entry.personData
			context += `\n${p.name} (${p.relation}): ${p.text || ''}`
			for (const m of (p.memories || []).sort((a, b) => (b.memory_priority || 1) - (a.memory_priority || 1))) {
				context += `\n  - ${m.memory}`
			}
		}
		if (entry.type === 'text' && entry.textData) {
			const t = entry.textData
			context += `\n${t.title}: ${t.text || ''}`
			for (const m of t.memories || []) {
				context += `\n  - ${m.memory}`
			}
		}
	}
	return context.trim()
}

// ─────────────────────────────────────────────
// Get patient name from DB or fallback
// ─────────────────────────────────────────────
const getPatientName = async (patientId) => {
	try {
		const { Patient } = await import('../models/memoryVault.js')
		const patient = await Patient.findById(patientId).lean()
		return patient?.name || DEMO_PATIENT_NAME
	} catch {
		return DEMO_PATIENT_NAME
	}
}

// ─────────────────────────────────────────────
// Main: generate warm AI response
// ─────────────────────────────────────────────
export const generateResponse = async (patientId, query) => {
	// Try to get real data from DB, fall back to hardcoded demo
	let patientName = DEMO_PATIENT_NAME
	let context = DEMO_CONTEXT

	try {
		const [name, dbContext] = await Promise.all([getPatientName(patientId), buildContextFromDB(patientId)])
		if (name) patientName = name
        else patientName = "Rajan"
		if (dbContext && dbContext.length > 30) context = dbContext
	} catch {
		console.log('DB unavailable — using hardcoded demo context')
	}

	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'http://localhost:5000',
			'X-Title': 'Recall',
		},
		body: JSON.stringify({
			model: 'arcee-ai/trinity-large-preview:free',
			max_tokens: 120,
			messages: [
				{
					role: 'system',
					content: `You are Recall, a warm and gentle memory companion for ${patientName}, who has dementia.

Rules:
- Reply in 2 short simple sentences ONLY
- ALWAYS speak directly to ${patientName} using "you" and "your" — NEVER use third person (he/she/they)
- Always call the patient by name: ${patientName}
- Use ONLY the memories listed below — never invent anything
- If the patientName and the memory of a person whose name is same, then they are the same. Talk about them or about them when they ask about their friends, family, etc.
- Never say "I don't know" or "I'm not sure"
- Be warm, loving, and reassuring
- No bullet points, no lists — just natural warm speech
- Example: "You visited Munnar with Meena and had tea at the hillside shop" — NOT "He visited Munnar"

${patientName}'s memories:
${context}`,
				},
				{
					role: 'user',
					content: query,
				},
			],
		}),
	})

	if (!response.ok) {
		const err = await response.text()
		throw new Error(`OpenRouter error: ${err}`)
	}

	const data = await response.json()
	return data.choices[0].message.content.trim()
}


export const generateEmbedding = () => {}