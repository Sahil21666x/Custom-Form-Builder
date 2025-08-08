import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { listForms } from "../lib/api"

export default function Forms() {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await listForms()
        setForms(data.forms || [])
      } catch (e) {
        setError("Failed to load forms")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-slate-800">Your Forms</h1>
      <p className="text-sm text-slate-600 mb-4">All forms you have created (no auth; global demo list).</p>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : forms.length === 0 ? (
        <div className="border-dashed border rounded p-6 text-sm text-slate-500 bg-white">
          No forms yet. Go to the Builder to create one.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((f) => (
            <div
              key={f._id}
              className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="text-sm text-slate-500">{new Date(f.createdAt).toLocaleString()}</div>
              <div className="font-medium text-slate-900 mt-1 line-clamp-2">{f.title}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/preview/${f._id}`}
                  className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                >
                  Preview
                </Link>
                <Link
                  to={`/fill/${f._id}`}
                  className="px-3 py-1.5 rounded bg-teal-600 text-white text-xs hover:bg-teal-700"
                >
                  Fill
                </Link>
                <a
                  className="px-3 py-1.5 rounded bg-slate-200 text-slate-800 text-xs"
                  href={`${window.location.origin}/fill/${f._id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Public Link
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
