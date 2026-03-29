import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'node:dns/promises'
import app from './src/app.js'

dotenv.config({ quiet: true })

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

const startServer = async () => {
	try {
		dns.setDefaultResultOrder('ipv4first')
		dns.setServers(['1.1.1.1', '8.8.8.8'])

		if (MONGO_URI) {
			await mongoose.connect(MONGO_URI)
			console.log('✅ MongoDB connected')
		} else {
			console.log('⚠️  No MONGO_URI — running with hardcoded demo data')
		}
	} catch (err) {
		console.warn('⚠️  MongoDB failed:', err.message)
		console.log('▶️  Starting anyway with hardcoded demo data...')
	}

	app.listen(PORT, () => {
		console.log(`🚀 Server on http://localhost:${PORT}`)
	})
}

startServer()
