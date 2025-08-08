import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"
import formsRouter from "./routes/forms.js"
import responsesRouter from "./routes/responses.js"
import uploadRouter from "./routes/upload.js"

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors({
  origin: ["https://custom-form-builder-backend.onrender.com", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json({ limit: "2mb" }))

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/forms", formsRouter)
app.use("/api/responses", responsesRouter)
app.use("/api/upload", uploadRouter)

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/formbuilder"

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected")
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })
