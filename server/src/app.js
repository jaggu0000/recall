import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import memoryVaultRoutes from "./routes/memoryVaultRoutes.js";

dotenv.config();

const app = express();

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
// app.use(
// 	cors({
// 		origin: process.env.CLIENT_URL,
// 		credentials: true,
// 		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// 		allowedHeaders: ["Content-Type", "Authorization"],
// 	}),
// );
app.use(express.json());

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use("/api/memory-vault", memoryVaultRoutes);

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
	res.json({ message: "Dementia Care API is running" });
});

export default app;
