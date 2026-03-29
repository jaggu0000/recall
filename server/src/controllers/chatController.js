import { generateResponse } from '../services/ragService.js'

// POST /api/chat
// Body: { patientId, query }
export const chat = async (req, res) => {
	try {
		const { patientId, query } = req.body

		if (!query) {
			return res.status(400).json({ success: false, message: 'query is required' })
		}

		// patientId is optional — falls back to demo data if missing
		const response = await generateResponse(patientId || 'demo', query)

		res.status(200).json({ success: true, response })
	} catch (err) {
		console.error('Chat error:', err.message)
		res.status(500).json({ success: false, message: err.message })
	}
}
