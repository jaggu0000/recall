import express from 'express'
import multer from 'multer'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.post('/transcribe', upload.single('file'), async (req, res) => {
	try {
		const formData = new FormData()
		formData.append('file', fs.createReadStream(req.file.path))

		const response = await axios.post('http://127.0.0.1:8000/transcribe/', formData, {
			headers: formData.getHeaders(),
		})

		res.json(response.data)

		// cleanup
		fs.unlinkSync(req.file.path)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Transcription failed' })
	}
})

export default router
