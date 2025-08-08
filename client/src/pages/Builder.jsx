import { useState } from "react"
import ImageUploader from "../components/ImageUploader.jsx"
import QuestionCard from "../components/QuestionCard.jsx"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { createForm, resolveImageUrl } from "../lib/api"
import { useNavigate } from "react-router-dom"

const newQuestion = (type) => ({
  id: String(Date.now() + Math.random()),
  type, // categorize | cloze | comprehension
  questionText: "",
  questionImage: "",
  meta:
    type === "categorize"
      ? { categories: [], items: [] }
      : type === "cloze"
      ? { text: "", blanks: [] } // blanks = [{id, answer}]
      : { passageText: "", passageImage: "", subQuestions: [] }
})

export default function Builder() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [headerImage, setHeaderImage] = useState("")
  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [link, setLink] = useState("")

  const onDragEnd = (result) => {
    const { destination, source } = result
    if (!destination) return
    if (destination.index === source.index && destination.droppableId === source.droppableId) return
    const copy = Array.from(questions)
    const [rem] = copy.splice(source.index, 1)
    copy.splice(destination.index, 0, rem)
    setQuestions(copy)
  }

  const add = (t) => setQuestions((prev) => [...prev, newQuestion(t)])
  const update = (id, patch) => setQuestions((prev) => prev.map((q) => (q.id === id ? patch : q)))
  const remove = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id))

  const canSave = title.trim() && questions.length > 0

  const saveForm = async () => {
    if (!canSave) return
    setSaving(true)
    setError("")
    try {
      const payload = { title, headerImage, questions }
      const { data } = await createForm(payload)
      const id = data?.form?._id
      if (id) {
        const publicLink = `${window.location.origin}/fill/${id}`
        setLink(publicLink)
        navigate(`/preview/${id}`)
      }
    } catch (e) {
      setError("Failed to save form. Check server connection.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 grid md:grid-cols-[260px_1fr] gap-6">
      <aside className="border rounded-md p-3 h-max bg-white shadow-sm">
        <div className="text-sm font-semibold mb-3 text-slate-800">Add blocks</div>
        <div className="grid gap-2">
          <button className="px-3 py-2 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => add("categorize")}>
            + Categorize
          </button>
          <button className="px-3 py-2 rounded text-sm bg-amber-600 text-white hover:bg-amber-700" onClick={() => add("cloze")}>
            + Cloze
          </button>
          <button className="px-3 py-2 rounded text-sm bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => add("comprehension")}>
            + Comprehension
          </button>
        </div>
        <div className="mt-6 border-t pt-4">
          <ImageUploader label="Header image" onUploaded={setHeaderImage} />
        </div>
      </aside>

      <section className="space-y-6">
        <div className="border rounded-md p-4 bg-white shadow-sm">
          <input
            className="w-full text-2xl font-semibold border-none focus:ring-0 p-0 text-slate-900 placeholder:text-slate-400"
            placeholder="Form title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {headerImage && (
            <img
              src={resolveImageUrl(headerImage) || "/placeholder.svg?height=200&width=800&query=header-image"}
              alt="Header"
              className="mt-3 max-h-48 rounded border"
            />
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {questions.map((q, idx) => (
                  <Draggable draggableId={q.id} index={idx} key={q.id}>
                    {(drag) => (
                      <div ref={drag.innerRef} {...drag.draggableProps}>
                        <div className="mb-1 pl-10">
                          <div
                            className="-ml-10 w-8 h-8 flex items-center justify-center cursor-grab select-none text-slate-500"
                            title="Drag to reorder"
                            {...drag.dragHandleProps}
                          >
                            ☰
                          </div>
                        </div>
                        <QuestionCard
                          question={q}
                          onChange={(patch) => update(q.id, patch)}
                          onRemove={() => remove(q.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {questions.length === 0 && (
                  <div className="text-sm text-slate-500 border-dashed border rounded p-6 text-center bg-white">
                    Add a question from the sidebar to get started.
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-60 hover:bg-emerald-700"
            disabled={!canSave || saving}
            onClick={saveForm}
          >
            {saving ? "Saving..." : "Save form"}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>

        {link && (
          <div className="text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded px-3 py-2 inline-block">
            Public link:{" "}
            <a className="underline" href={link} target="_blank" rel="noreferrer">
              {link}
            </a>
          </div>
        )}
      </section>
    </div>
  )
}
