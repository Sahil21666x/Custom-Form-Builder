import mongoose from "mongoose"

const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { _id: false }
)

const ResponseSchema = new mongoose.Schema(
  {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    answers: { type: [AnswerSchema], default: [] }
  },
  { timestamps: { createdAt: "submittedAt", updatedAt: false } }
)

export const ResponseModel = mongoose.model("Response", ResponseSchema)
