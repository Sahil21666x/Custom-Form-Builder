import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getForm, resolveImageUrl } from "../lib/api"
import CategorizeViewer from "../components/categorize/CategorizeViewer.jsx"
import ClozeViewer from "../components/cloze/ClozeViewer.jsx"
import ComprehensionViewer from "../components/comprehension/ComprehensionViewer.jsx"

export default function Preview() {
  const { formId } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const { data } = await getForm(formId)
        if (mounted) setForm(data.form)
      } catch (e) {
        setError("Failed to load form")
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => (mounted = false)
  }, [formId])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : form ? (
        <>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">{form.title}</h1>
            {form.headerImage && <img src={resolveImageUrl(form.headerImage) || "/placeholder.svg"} alt="Header" className="rounded border max-h-48" />}
          </div>

          <div className="space-y-6">
            {form.questions.map((q) => (
              <div key={q._id || q.id} className="border rounded p-4 bg-white shadow-sm">
                <div className="text-xs text-slate-500 mb-2 capitalize">{q.type}</div>
                <div className="font-medium mb-3 text-slate-900">{q.questionText}</div>
                {q.questionImage && <img src={resolveImageUrl(q.questionImage) || "/placeholder.svg"} alt="Question" className="rounded border max-h-48 mb-3" />}

                {q.type === "categorize" && (
                  <CategorizeViewer meta={q.meta} onChange={() => {}} />
                )}
                {q.type === "cloze" && (
                  <ClozeViewer meta={{ ...q.meta, userAnswers: {} }} onChange={() => {}} preview />
                )}
                {q.type === "comprehension" && (
                  <ComprehensionViewer meta={{ ...q.meta, answers: {} }} onChange={() => {}} />
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Link
              to={`/fill/${form._id}`}
              className="inline-flex items-center px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Open public fill link
            </Link>
          </div>
        </>
      ) : null}
    </div>
  )
}
