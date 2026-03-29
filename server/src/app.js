import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import memoryVaultRoutes from './routes/memoryVaultRoutes.js'
import patientRoutes from './routes/patientRoutes.js'
import ttsRoutes from './routes/ttsRoutes.js'
import chatRoutes from './routes/chatRoutes.js'

dotenv.config({ quiet: true })

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

app.use('/api/memory-vault', memoryVaultRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/chat', chatRoutes)
app.use('/whisper', ttsRoutes)

app.get('/', (req, res) => {
	res.json({ message: 'Recall API is running ✅' })
})

export default app
