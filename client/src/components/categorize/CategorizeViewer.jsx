import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useMemo } from "react"

export default function CategorizeViewer({ meta, onChange, readOnly = false }) {
  // meta: { categories: [], items: [{id,label,categoryId}] }
  const categories = meta.categories || []
  const items = meta.items || []

  const grouped = useMemo(() => {
    const byCat = {}
    categories.forEach((c) => (byCat[c.id] = []))
    items.forEach((it) => {
      if (it.categoryId && byCat[it.categoryId]) byCat[it.categoryId].push(it)
    })
    const unassigned = items.filter((it) => !it.categoryId)
    return { byCat, unassigned }
  }, [categories, items])

  const applyMove = (itemId, destDroppableId) => {
    const isUnassigned = destDroppableId === "unassigned"
    const catId = destDroppableId.startsWith("cat:") ? destDroppableId.slice(4) : null
    const copy = items.map((it) =>
      it.id === itemId ? { ...it, categoryId: isUnassigned ? null : catId } : it
    )
    onChange({ ...meta, items: copy })
  }

  const onDragEnd = (result) => {
    if (readOnly) return
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return
    applyMove(draggableId, destination.droppableId)
  }

  if (readOnly) {
    // Render static grouped view
    return (
      <div className="grid md:grid-cols-4 gap-4">
        <div className="border rounded p-3 bg-slate-50">
          <div className="font-medium text-sm mb-2 text-slate-800">Unassigned</div>
          {grouped.unassigned.map((it) => (
            <div key={it.id} className="bg-white border rounded px-3 py-2 text-sm mb-2">
              {it.label}
            </div>
          ))}
        </div>
        {categories.map((c) => (
          <div key={c.id} className="border rounded p-3 bg-white">
            <div className="font-medium text-sm mb-2 text-slate-800">{c.name}</div>
            {(grouped.byCat[c.id] || []).map((it) => (
              <div key={it.id} className="bg-emerald-50 border rounded px-3 py-2 text-sm mb-2">
                {it.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid md:grid-cols-4 gap-4">
        <Droppable droppableId="unassigned" direction="vertical">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="border rounded p-3 bg-slate-50 min-h-[120px]"
            >
              <div className="font-medium text-sm mb-2 text-slate-800">Unassigned</div>
              {grouped.unassigned.map((it, idx) => (
                <Draggable draggableId={it.id} index={idx} key={it.id}>
                  {(drag) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      {...drag.dragHandleProps}
                      className="bg-white border rounded px-3 py-2 text-sm flex items-center justify-between mb-2 cursor-grab"
                    >
                      <span>{it.label}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {categories.map((c) => (
          <Droppable droppableId={`cat:${c.id}`} direction="vertical" key={c.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="border rounded p-3 bg-white min-h-[120px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-slate-800">{c.name}</span>
                </div>
                {(grouped.byCat[c.id] || []).map((it, idx) => (
                  <Draggable draggableId={it.id} index={idx} key={it.id}>
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        {...drag.dragHandleProps}
                        className="bg-emerald-50 border rounded px-3 py-2 text-sm flex items-center justify-between mb-2 cursor-grab"
                      >
                        <span>{it.label}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
