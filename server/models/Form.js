import mongoose from "mongoose"

const CategorizeItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    categoryId: { type: String, default: null }
  },
  { _id: false }
)

const CategorizeCategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true }
  },
  { _id: false }
)

const ClozeBlankSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // unique blank id for cloze
    answer: { type: String, default: "" }
  },
  { _id: false }
)

const MCQOptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, default: "" }
  },
  { _id: false }
)

const SubQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    kind: { type: String, enum: ["mcq", "short"], required: true },
    text: { type: String, default: "" },
    options: { type: [MCQOptionSchema], default: void 0 },
    correctOptionId: { type: String, default: "" },
    correctAnswer: { type: String, default: "" }
  },
  { _id: false }
)

const QuestionSchema = new mongoose.Schema(
  {
    id: { type: String }, // client id (for editing); not used by DB
    type: { type: String, enum: ["categorize", "cloze", "comprehension"], required: true },
    questionText: { type: String, default: "" },
    questionImage: { type: String, default: "" },
    meta: {
      type: new mongoose.Schema(
        {
          // categorize
          categories: { type: [CategorizeCategorySchema], default: void 0 },
          items: { type: [CategorizeItemSchema], default: void 0 },
          // cloze
          text: { type: String, default: "" },
          blanks: { type: [ClozeBlankSchema], default: void 0 },
          // comprehension
          passageText: { type: String, default: "" },
          passageImage: { type: String, default: "" },
          subQuestions: { type: [SubQuestionSchema], default: void 0 }
        },
        { _id: false }
      ),
      default: {}
    }
  },
  { timestamps: true }
)

const FormSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    headerImage: { type: String, default: "" },
    questions: { type: [QuestionSchema], default: [] }
  },
  { timestamps: true }
)

export const Form = mongoose.model("Form", FormSchema)
