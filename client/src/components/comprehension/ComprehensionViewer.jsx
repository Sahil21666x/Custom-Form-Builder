export default function ComprehensionViewer({ meta, onChange }) {
  // meta: { passageText, passageImage, subQuestions: [...] }
  const setAnswer = (sid, value) => {
    const next = { ...(meta.answers || {}) }
    next[sid] = value
    onChange({ ...meta, answers: next })
  }

  return (
    <div className="space-y-4">
      {meta.passageImage && <img src={meta.passageImage || "/placeholder.svg"} alt="Passage" className="max-h-56 rounded border" />}
      <div className="whitespace-pre-wrap text-gray-900">{meta.passageText}</div>

      <div className="space-y-3">
        {meta.subQuestions.map((s, idx) => (
          <div key={s.id} className="border rounded p-3">
            <div className="text-sm font-medium mb-2">{`${String.fromCharCode(97 + idx)}. ${s.text}`}</div>
            {s.kind === "mcq" ? (
              <div className="space-y-2">
                {(s.options || []).map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`mcq-${s.id}`}
                      checked={(meta.answers || {})[s.id] === o.id}
                      onChange={() => setAnswer(s.id, o.id)}
                    />
                    <span>{o.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                className="border rounded px-3 py-2 w-full"
                type="text"
                value={(meta.answers || {})[s.id] || ""}
                onChange={(e) => setAnswer(s.id, e.target.value)}
                placeholder="Your answer"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
