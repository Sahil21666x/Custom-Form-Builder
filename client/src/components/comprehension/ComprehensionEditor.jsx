import ImageUploader from "../ImageUploader.jsx"
import { resolveImageUrl } from "../../lib/api"

export default function ComprehensionEditor({ value, onChange }) {
  const meta = value || { passageText: "", passageImage: "", subQuestions: [] }

  const addMCQ = () => {
    const q = {
      id: String(Date.now()),
      kind: "mcq",
      text: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" }
      ],
      correctOptionId: "a"
    }
    onChange({ ...meta, subQuestions: [...meta.subQuestions, q] })
  }

  const addShort = () => {
    const q = { id: String(Date.now()), kind: "short", text: "", correctAnswer: "" }
    onChange({ ...meta, subQuestions: [...meta.subQuestions, q] })
  }

  const updateSub = (id, patch) => {
    onChange({
      ...meta,
      subQuestions: meta.subQuestions.map((s) => (s.id === id ? { ...s, ...patch } : s))
    })
  }

  const removeSub = (id) => {
    onChange({ ...meta, subQuestions: meta.subQuestions.filter((s) => s.id !== id) })
  }

  const updateOption = (sid, oid, patch) => {
    const s = meta.subQuestions.find((x) => x.id === sid)
    if (!s) return
    const next = s.options.map((o) => (o.id === oid ? { ...o, ...patch } : o))
    updateSub(sid, { options: next })
  }

  const addOption = (sid) => {
    const s = meta.subQuestions.find((x) => x.id === sid)
    if (!s) return
    const nextId = String.fromCharCode(97 + (s.options?.length || 0)) // a,b,c...
    updateSub(sid, { options: [...(s.options || []), { id: nextId, text: "" }] })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Passage</label>
        <textarea
          className="mt-1 w-full border rounded px-3 py-2 min-h-[120px]"
          placeholder="Paste or write the reading passage here..."
          value={meta.passageText}
          onChange={(e) => onChange({ ...meta, passageText: e.target.value })}
        />
      </div>
      <ImageUploader
        label="Passage image (optional)"
        onUploaded={(url) => onChange({ ...meta, passageImage: url })}
      />
      {meta.passageImage && (
        <img
          src={resolveImageUrl(meta.passageImage) || "/placeholder.svg?height=200&width=400&query=passage-image"}
          alt="Passage"
          className="max-h-48 rounded border"
        />
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Sub-questions</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded text-sm bg-indigo-600 text-white hover:bg-indigo-700" onClick={addMCQ}>
            Add MCQ
          </button>
          <button className="px-3 py-1.5 rounded text-sm bg-sky-600 text-white hover:bg-sky-700" onClick={addShort}>
            Add Short Answer
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {meta.subQuestions.map((s) => (
          <div key={s.id} className="border rounded p-3 space-y-2 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-slate-600">{s.kind}</span>
              <button className="text-xs text-rose-600" onClick={() => removeSub(s.id)}>
                Remove
              </button>
            </div>
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Question text"
              value={s.text}
              onChange={(e) => updateSub(s.id, { text: e.target.value })}
            />
            {s.kind === "mcq" ? (
              <div className="space-y-2">
                <div className="space-y-2">
                  {(s.options || []).map((o) => (
                    <div key={o.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${s.id}`}
                        checked={s.correctOptionId === o.id}
                        onChange={() => updateSub(s.id, { correctOptionId: o.id })}
                      />
                      <input
                        className="border rounded px-3 py-1 w-full text-sm"
                        placeholder={`Option ${o.id.toUpperCase()}`}
                        value={o.text}
                        onChange={(e) => updateOption(s.id, o.id, { text: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <button className="px-2 py-1 rounded text-xs bg-slate-200" onClick={() => addOption(s.id)}>
                  Add Option
                </button>
              </div>
            ) : (
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Correct answer"
                value={s.correctAnswer || ""}
                onChange={(e) => updateSub(s.id, { correctAnswer: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
