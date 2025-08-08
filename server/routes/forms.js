import { Router } from "express"
import { Form } from "../models/Form.js"

const router = Router()

// List forms (demo: all)
router.get("/", async (_req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 }).lean()
    res.json({ forms })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

// Create form
router.post("/", async (req, res) => {
  try {
    const { title, headerImage, questions } = req.body || {}
    if (!title || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid payload" })
    }
    // Ensure every cloze blank has a unique id
    const patchedQuestions = questions.map(q => {
      if (q.type === "cloze" && q.meta && Array.isArray(q.meta.blanks)) {
        q.meta.blanks = q.meta.blanks.map((b, idx) => ({
          ...b,
          id: b.id || b.blankId || `blank_${Date.now()}_${Math.floor(Math.random()*1000)}_${idx}`
        }))
      }
      return q
    })
    const form = await Form.create({ title, headerImage, questions: patchedQuestions })
    res.json({ form })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

// Get form by id
router.get("/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id)
    if (!form) return res.status(404).json({ error: "Not found" })
    res.json({ form })
  } catch (e) {
    res.status(400).json({ error: "Invalid id" })
  }
})

export default router
