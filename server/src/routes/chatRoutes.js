import express from 'express'
import { chat } from '../controllers/chatController.js'

const router = express.Router()

// POST /api/chat
// Body: { patientId?, query }
router.post('/', chat)

export default router
