import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app.js";
import express from "express"

dotenv.config({quiet: true});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

import dns from "node:dns/promises";

const server = express();
server.use("/api", app); // Assigning prefix

const startServer = async () => {
	try {
        dns.setServers(["1.1.1.1"]);
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
