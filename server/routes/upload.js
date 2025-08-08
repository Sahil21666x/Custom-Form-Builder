import { Router } from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, unique + ext)
  }
})

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"))
  cb(null, true)
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
})

const router = Router()

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" })
  const url = `/uploads/${req.file.filename}`
  res.json({ url })
})

export default router
