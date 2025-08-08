import { useState } from "react"
import ImageUploader from "./ImageUploader.jsx"
import CategorizeEditor from "./categorize/CategorizeEditor.jsx"
import ClozeEditor from "./cloze/ClozeEditor.jsx"
import ComprehensionEditor from "./comprehension/ComprehensionEditor.jsx"
import { resolveImageUrl } from "../lib/api"

export default function QuestionCard({ question, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(true)
  const update = (patch) => onChange({ ...question, ...patch })

  return (
    <div className="border rounded-md bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs rounded px-2 py-1 capitalize text-white ${
              question.type === "categorize"
                ? "bg-emerald-600"
                : question.type === "cloze"
                ? "bg-amber-600"
                : "bg-indigo-600"
            }`}
          >
            {question.type}
          </span>
          <input
            type="text"
            placeholder="Question text"
            value={question.questionText || ""}
            onChange={(e) => update({ questionText: e.target.value })}
            className="text-sm border-none focus:ring-0 p-0 w-[48ch] text-slate-900 placeholder:text-slate-400 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs text-slate-600 hover:text-slate-900"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <button className="text-xs text-rose-600 hover:text-rose-700" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <ImageUploader
            label="Question image"
            onUploaded={(url) => update({ questionImage: url })}
          />
          {question.questionImage && (
            <img
              src={resolveImageUrl(question.questionImage) || "/placeholder.svg?height=200&width=400&query=question-image"}
              alt="Question"
              className="max-h-48 rounded border"
            />
          )}

          {question.type === "categorize" && (
            <CategorizeEditor
              value={question.meta || { categories: [], items: [] }}
              onChange={(meta) => update({ meta })}
            />
          )}
          {question.type === "cloze" && (
            <ClozeEditor
              value={question.meta || { text: "", blanks: [] }}
              onChange={(meta) => update({ meta })}
            />
          )}
          {question.type === "comprehension" && (
            <ComprehensionEditor
              value={question.meta || { passageText: "", passageImage: "", subQuestions: [] }}
              onChange={(meta) => update({ meta })}
            />
          )}
        </div>
      )}
    </div>
  )
}
