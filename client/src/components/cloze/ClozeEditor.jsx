import { useRef } from "react"

// Token pattern [[b:ID]]
const token = (id) => `[[b:${id}]]`
const tokenRegex = /\[\[b:([^\]]+)\]\]/g

const makeBlankId = () => `blank_${Date.now()}_${Math.floor(Math.random() * 1000)}`

export default function ClozeEditor({ value, onChange }) {
  const meta = value || { text: "", blanks: [] }
  const taRef = useRef(null)

  const update = (patch) => onChange({ ...meta, ...patch })

  const makeBlank = () => {
    const ta = taRef.current
    if (!ta) return
    
    const start = ta.selectionStart
    const end = ta.selectionEnd
    if (start == null || end == null || start === end) return
    
    const selected = meta.text.slice(start, end)
    if (!selected.trim()) return

    // Check if selection overlaps with any existing token (more precise)
    let overlap = false;
    tokenRegex.lastIndex = 0;
    let m;
    while ((m = tokenRegex.exec(meta.text)) !== null) {
      const tokenStart = m.index;
      const tokenEnd = m.index + m[0].length;
      // If selection and token overlap
      if (!(end <= tokenStart || start >= tokenEnd)) {
        overlap = true;
        break;
      }
    }
    if (overlap) {
      alert("Cannot create blank that overlaps with existing tokens");
      return;
    }

    const textBefore = meta.text.slice(0, start);
    const textAfter = meta.text.slice(end);
    const id = makeBlankId();
    const newText = `${textBefore}${token(id)}${textAfter}`;
    const newBlanks = [...(meta.blanks || []), { id, answer: selected }];

    update({ text: newText, blanks: newBlanks });

    // Move caret after token
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + token(id).length;
    });
  }

  const removeBlank = (id) => {
    const b = (meta.blanks || []).find((x) => x.id === id)
    const answer = b?.answer || ""
    const newText = meta.text.replaceAll(token(id), answer)
    const newBlanks = (meta.blanks || []).filter((x) => x.id !== id)
    update({ text: newText, blanks: newBlanks })
    requestAnimationFrame(() => taRef.current?.focus())
  }

  const setBlankAnswer = (id, answer) => {
    const next = (meta.blanks || []).map((b) => 
      b.id === id ? { ...b, answer } : b
    )
    update({ blanks: next })
  }

  const blanksInText = () => {
    const found = []
    let m
    tokenRegex.lastIndex = 0
    while ((m = tokenRegex.exec(meta.text)) !== null) {
      found.push(m[1])
    }
    return found
  }

  const presentIds = new Set((meta.blanks || []).map((b) => b.id))
  const inText = blanksInText()
  const orphanedTokens = inText.filter(id => !presentIds.has(id))

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Select text in the area below and click "Make blank". The selection will become a blank and the selected text will be stored as the correct answer.
      </p>
      
      <div>
        <label className="text-sm font-medium">Cloze text</label>
        <textarea
          ref={taRef}
          className="mt-1 w-full border rounded px-3 py-2 min-h-[140px]"
          placeholder={'e.g., "The sky is blue and the grass is green." Select a word to blank it.'}
          value={meta.text}
          onChange={(e) => update({ text: e.target.value })}
        />
        <button
          type="button"
          className="mt-2 px-3 py-1.5 rounded bg-amber-600 text-white text-sm hover:bg-amber-700"
          onClick={makeBlank}
        >
          Make blank
        </button>
      </div>

      {orphanedTokens.length > 0 && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-700 text-sm">
          Warning: Found {orphanedTokens.length} token(s) in text without corresponding blanks.
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm font-medium">Blanks & correct answers</div>
        {(meta.blanks || []).length === 0 ? (
          <div className="text-xs text-slate-500">No blanks yet. Select text then click Make blank.</div>
        ) : (
          <div className="grid gap-2">
            {meta.blanks.map((b, idx) => (
              <div key={b.id} className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Blank {idx + 1} ({token(b.id)})</span>
                <input
                  className="border rounded px-3 py-1 text-sm flex-1"
                  placeholder="Correct answer"
                  value={b.answer || ""}
                  onChange={(e) => setBlankAnswer(b.id, e.target.value)}
                />
                {inText.includes(b.id) ? (
                  <button
                    className="text-xs px-2 py-1 rounded bg-rose-600 text-white"
                    onClick={() => removeBlank(b.id)}
                  >
                    Remove
                  </button>
                ) : (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    Token missing in text
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500">
        Tokens in text appear like {`[[b:123]]`}. They will render as blanks for respondents with a draggable word bank.
      </div>
    </div>
  )
}