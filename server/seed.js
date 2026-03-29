// ─────────────────────────────────────────────
// SEED SCRIPT — run once before demo
// node seed.js
// ─────────────────────────────────────────────
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'node:dns/promises'
import { Patient, MemoryVault } from './src/models/memoryVault.js'
import { generateEmbedding } from './src/services/ragService.js'

dotenv.config({ quiet: true })

const seed = async () => {
    dns.setServers(['1.1.1.1'])
	await mongoose.connect(process.env.MONGO_URI)
	console.log('✅ MongoDB connected')

	// Clear existing demo data
	await Patient.deleteMany({ name: 'Rajan' })
	await MemoryVault.deleteMany({})
	console.log('🗑️  Cleared old demo data')

	// ── Create demo patient ──
	const patient = await Patient.create({
		name: 'Rajan',
		age: 78,
		notes: 'Responds well to warm, slow speech. Loves cricket and old Malayalam songs.',
	})
	console.log(`👤 Created patient: ${patient.name} (${patient._id})`)

	const pid = patient._id

	// ── Helper: create a person entry with embeddings ──
	const addPerson = async ({ name, relation, text, memories, priority = 5 }) => {
		const profileEmbed = await generateEmbedding(`${name} is the patient's ${relation}. ${text}`)
		const memoriesWithEmbeds = []
		for (const mem of memories) {
			const embedding = await generateEmbedding(mem.memory)
			memoriesWithEmbeds.push({ ...mem, embedding })
		}
		await MemoryVault.create({
			patientId: pid,
			type: 'person',
			addedBy: 'family',
			personData: {
				name,
				relation,
				text,
				person_priority: priority,
				embedding: profileEmbed,
				memories: memoriesWithEmbeds,
			},
		})
		console.log(`  ✅ Added person: ${name}`)
	}

	// ── Helper: create a text/event entry with embeddings ──
	const addTextEntry = async ({ title, text, memories, priority = 3 }) => {
		const embedding = await generateEmbedding(`${title}. ${text}`)
		const memoriesWithEmbeds = []
		for (const mem of memories) {
			const memEmbed = await generateEmbedding(mem.memory)
			memoriesWithEmbeds.push({ ...mem, embedding: memEmbed })
		}
		await MemoryVault.create({
			patientId: pid,
			type: 'text',
			addedBy: 'family',
			textData: {
				title,
				text,
				person_priority: priority,
				embedding,
				memories: memoriesWithEmbeds,
			},
		})
		console.log(`  ✅ Added text entry: ${title}`)
	}

	// ── Seed person entries ──
	console.log('\n👨‍👩‍👧 Seeding people...')

	await addPerson({
		name: 'Priya',
		relation: 'child',
		text: "Priya is Rajan's daughter. She lives in Bangalore and works as a doctor. She visits every month.",
		priority: 10,
		memories: [
			{
				memory: "Priya visited last Sunday and brought Rajan's favourite gulab jamun. They sat on the balcony and talked for hours.",
				memory_priority: 5,
			},
			{
				memory: "Priya used to sit on Rajan's lap and ask him to tell stories about his childhood in Kerala.",
				memory_priority: 4,
			},
			{
				memory: "On Rajan's 75th birthday, Priya flew in from Bangalore as a surprise. Rajan cried happy tears.",
				memory_priority: 5,
			},
		],
	})

	await addPerson({
		name: 'Arjun',
		relation: 'grandchild',
		text: "Arjun is Rajan's grandson, Priya's son. He is 9 years old and loves cricket just like Rajan.",
		priority: 9,
		memories: [
			{
				memory: 'Arjun calls Rajan every evening before bed and says goodnight. Rajan loves this routine.',
				memory_priority: 5,
			},
			{
				memory: 'Rajan taught Arjun how to bowl a googly in the backyard last summer. Arjun was so excited.',
				memory_priority: 4,
			},
			{
				memory: "Arjun drew a portrait of Rajan for a school project called 'My Hero'. Rajan keeps it on his bedside table.",
				memory_priority: 5,
			},
		],
	})

	await addPerson({
		name: 'Meena',
		relation: 'spouse',
		text: "Meena is Rajan's wife. They have been married for 50 years. She passed away 3 years ago. Rajan misses her deeply.",
		priority: 10,
		memories: [
			{
				memory: 'Rajan and Meena got married in 1975 in a temple in Thrissur, Kerala. It was a beautiful monsoon day.',
				memory_priority: 5,
			},
			{
				memory: "Meena used to make Rajan's favourite sambar every Friday without fail. The whole house would smell wonderful.",
				memory_priority: 5,
			},
			{
				memory: 'Every evening, Rajan and Meena would take a walk in the garden and listen to old Kishore Kumar songs together.',
				memory_priority: 4,
			},
		],
	})

	await addPerson({
		name: 'Suresh',
		relation: 'sibling',
		text: "Suresh is Rajan's younger brother. He lives in Kochi and calls every weekend.",
		priority: 7,
		memories: [
			{
				memory: 'Rajan and Suresh grew up together in a small house near Chalakudy river. They used to fish every morning.',
				memory_priority: 4,
			},
			{
				memory: "Suresh and Rajan used to watch cricket matches on a neighbour's black and white TV as children.",
				memory_priority: 3,
			},
		],
	})

	// ── Seed text/event entries ──
	console.log('\n📝 Seeding personal memories...')

	await addTextEntry({
		title: 'Trip to Munnar',
		text: 'Rajan and his family went to Munnar in 2010. It was a family trip with Meena, Priya, and little Arjun who was just 3 years old.',
		priority: 5,
		memories: [
			{
				memory: 'In Munnar, Rajan and Meena had tea at a small hillside shop overlooking the tea gardens. Meena said it was the best tea of her life.',
				memory_priority: 5,
			},
			{
				memory: 'Little Arjun ran through the tea gardens and Rajan chased him, laughing. Priya took a photo that still sits on the living room shelf.',
				memory_priority: 5,
			},
		],
	})

	await addTextEntry({
		title: "Rajan's career",
		text: 'Rajan worked as a school headmaster in Thrissur for 35 years. He was loved by students and teachers alike. He retired in 2008.',
		priority: 4,
		memories: [
			{
				memory: "Many of Rajan's former students still visit him during Onam and Vishu every year.",
				memory_priority: 4,
			},
			{
				memory: 'Rajan received a gold medal from the state education department for his service in 1998.',
				memory_priority: 3,
			},
		],
	})

	await addTextEntry({
		title: 'Love of cricket',
		text: 'Rajan has loved cricket since childhood. His favourite player is Sunil Gavaskar. He never misses an India match.',
		priority: 4,
		memories: [
			{
				memory: 'Rajan listened to the 1983 World Cup final on a small transistor radio in his school office. He was so happy India won.',
				memory_priority: 5,
			},
		],
	})

	console.log(`\n✅ Seed complete! Patient ID: ${patient._id}`)
	console.log('📋 Copy this patientId into your frontend .env or config:')
	console.log(`   PATIENT_ID=${patient._id}`)

	await mongoose.disconnect()
	process.exit(0)
}

seed().catch((err) => {
	console.error('❌ Seed failed:', err.message)
	process.exit(1)
})
