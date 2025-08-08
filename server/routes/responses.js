import { Router } from "express"
import { ResponseModel } from "../models/Response.js"
import { Form } from "../models/Form.js"

const router = Router()

// Submit response
router.post("/", async (req, res) => {
  try {
    const { formId, answers } = req.body || {}
    if (!formId || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid payload" })
    }
    const exists = await Form.exists({ _id: formId })
    if (!exists) return res.status(404).json({ error: "Form not found" })
    const doc = await ResponseModel.create({ formId, answers })
    res.json({ ok: true, responseId: doc._id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
