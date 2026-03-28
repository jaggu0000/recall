import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app.js";
import express from "express"

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


const server = express();
server.use("/api", app); // Assigning prefix

const startServer = async () => {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ MongoDB connected");

		server.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
		});
	} catch (err) {
		console.error("❌ Failed to connect to MongoDB:", err.message);
		process.exit(1);
	}
};

startServer();
