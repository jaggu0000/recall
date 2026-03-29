import express from 'express'
import multer from 'multer'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

// POST /whisper/transcribe
// Forwards audio file to your Python Whisper server on port 8000
router.post('/transcribe', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No audio file provided' })
		}

		const formData = new FormData()
		formData.append('file', fs.createReadStream(req.file.path))

		const response = await axios.post('http://127.0.0.1:8000/transcribe/', formData, {
			headers: formData.getHeaders(),
		})

		res.json(response.data)
	} catch (err) {
		console.error('Transcription error:', err.message)
		res.status(500).json({ error: 'Transcription failed', detail: err.message })
	} finally {
		// Always clean up uploaded file
		if (req.file?.path && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path)
		}
	}
})

export default router
