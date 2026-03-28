import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import memoryVaultRoutes from "./routes/memoryVaultRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import ttsRouter from "./routes/ttsRoutes.js";

dotenv.config({quiet: true});

const app = express();

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: "*",
    // credentials: true,
    // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use("/api/memory-vault", memoryVaultRoutes);
app.use("/api/patients", patientRoutes);
app.use('/whisper', ttsRouter)

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
	res.json({ message: "Dementia Care API is running" });
});

export default app;
