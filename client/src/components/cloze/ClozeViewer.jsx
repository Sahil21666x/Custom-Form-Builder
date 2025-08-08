import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

// Helpers to parse tokens [[b:ID]]
const tokenRegex = /\[\[b:([^\]]+)\]\]/g
const splitWithTokens = (text) => {
  const parts = []
  let lastIndex = 0
  let m
  while ((m = tokenRegex.exec(text)) !== null) {
    const [full, id] = m
    const start = m.index
    if (start > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, start) })
    }
    parts.push({ type: "blank", id })
    lastIndex = start + full.length
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) })
  }
  return parts
}

export default function ClozeViewer({ meta, onChange, preview = false }) {

  const blanks = meta.blanks || []


  const items = blanks.map((b) => ({ id: b.id, label: b.answer }))
  const itemLabel = (itemId) => items.find((i) => i.id === itemId)?.label || ""

  
  const userMap = meta.userMap || {}
  const usedItemIds = new Set(Object.values(userMap).filter(Boolean))
  const bankRemaining = items.filter((i) => !usedItemIds.has(i.id))

  const parts = splitWithTokens(meta.text || "")

  const updateState = (nextUserMap) => {
    const nextUserAnswers = {}
    Object.entries(nextUserMap).forEach(([blankId, itemId]) => {
      if (itemId) nextUserAnswers[blankId] = itemLabel(itemId)
    })
   
    onChange({ 
      ...meta, 
      userMap: nextUserMap, 
      userAnswers: nextUserAnswers,
      blanks: meta.blanks 
    })
  }

  const onDragEnd = (res) => {
    const { destination, source, draggableId } = res
    if (!destination) return

    const isBank = (id) => id === "bank"
    const isBlank = (id) => id.startsWith("blank:")

   
    if (!(isBank(source.droppableId) || isBlank(source.droppableId))) return
    if (!(isBlank(destination.droppableId) || isBank(destination.droppableId))) return

    const next = { ...userMap }

    
    if (isBank(destination.droppableId)) {
      for (const [blankId, itemId] of Object.entries(next)) {
        if (itemId === draggableId) {
          next[blankId] = undefined
          break
        }
      }
      updateState(next)
      return
    }

    // Dropped into a blank
    const destBlankId = destination.droppableId.replace("blank:", "")

    // Ensure uniqueness — remove from old blank if it exists
    for (const [blankId, itemId] of Object.entries(next)) {
      if (itemId === draggableId) {
        next[blankId] = undefined
      }
    }

    next[destBlankId] = draggableId
    updateState(next)
  }

  const clearBlank = (blankId) => {
    const next = { ...userMap }
    next[blankId] = undefined
    updateState(next)
  }

  if (preview) {
    // Non-interactive preview
    return (
      <div className="text-slate-900 leading-7">
        {parts.map((p, i) =>
          p.type === "text" ? (
            <span key={i}>{p.value}</span>
          ) : (
            <span key={p.id} className="inline-block min-w-[6ch] border-b-2 border-amber-600 mx-1" />
          )
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Word bank */}
        <div className="border rounded bg-amber-50 p-3">
          <div className="text-xs font-medium text-amber-800 mb-2">Word Bank</div>
          <Droppable droppableId="bank" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-2 min-h-[44px]"
              >
                {bankRemaining.map((it, idx) => (
                  <Draggable key={it.id} draggableId={it.id} index={idx}>
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        {...drag.dragHandleProps}
                        className="px-3 py-1.5 rounded bg-amber-600 text-white text-sm cursor-grab"
                      >
                        {it.label}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Text with droppable blanks */}
        <div className="mt-3 text-slate-900 leading-7 flex flex-wrap">
          {parts.map((p, i) =>
            p.type === "text" ? (
              <span key={i}>{p.value}</span>
            ) : (
              <Droppable key={p.id} droppableId={`blank:${p.id}`} direction="horizontal">
                {(provided2) => (
                  <span
                    ref={provided2.innerRef}
                    {...provided2.droppableProps}
                    className="inline-flex items-center gap-2 border-b-2 border-amber-600 min-w-[6ch] mx-1 px-1"
                    aria-label={`Blank ${p.id}`}
                    title="Drag an answer here"
                  >
                    {userMap[p.id] ? (
                      <Draggable draggableId={userMap[p.id]} index={i}>
                        {(drag2) => (
                          <span
                            ref={drag2.innerRef}
                            {...drag2.draggableProps}
                            {...drag2.dragHandleProps}
                            className="px-2 py-0.5 rounded bg-emerald-600 text-white text-sm"
                          >
                            {itemLabel(userMap[p.id])}
                          </span>
                        )}
                      </Draggable>
                    ) : (
                      <span className="text-slate-400 text-sm">Drop here</span>
                    )}
                    {provided2.placeholder}
                    {userMap[p.id] && (
                      <button
                        type="button"
                        className="text-xs text-slate-500"
                        onClick={() => clearBlank(p.id)}
                        title="Clear"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                )}
              </Droppable>
            )
          )}
        </div>
      </DragDropContext>
    </div>
  )
}