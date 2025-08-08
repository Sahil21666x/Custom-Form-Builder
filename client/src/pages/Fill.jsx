import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { getForm, submitResponse, resolveImageUrl } from "../lib/api"
import CategorizeViewer from "../components/categorize/CategorizeViewer.jsx"
import ClozeViewer from "../components/cloze/ClozeViewer.jsx"
import ComprehensionViewer from "../components/comprehension/ComprehensionViewer.jsx"

export default function Fill() {
  const { formId } = useParams()
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getForm(formId)
        const f = data.form
        setForm(f)

        // Seed respondent state WITHOUT any pre-answers from builder
        const initial = {}
        for (const q of f.questions) {
          if (q.type === "categorize") {
            initial[q._id] = {
              categories: q.meta?.categories || [],
              items: (q.meta?.items || []).map((it) => ({
                ...it,
                categoryId: null
              }))
            }
          } else if (q.type === "cloze") {
            initial[q._id] = {
              ...q.meta,
              blanks: (q.meta?.blanks || []).map(b => ({ ...b, id: b.id ?? b.blankId })), // ensure id is present
              userMap: {},
              userAnswers: {} // stores blankId → text value
            }
          } else if (q.type === "comprehension") {
            initial[q._id] = {
              ...q.meta,
              answers: {}
            }
          }
        }
        setAnswers(initial)
      } catch (e) {
        console.error(e)
        setError("Failed to load form")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formId])

  const setAns = (qid, meta) => {
    setAnswers((prev) => {
      const updated = { ...prev, [qid]: meta }
      console.log('Fill.jsx answers state:', updated)
      return updated
    })
  }

  const isQuestionAnswered = (q) => {
    const a = answers[q._id]
    if (!a) return false

    if (q.type === "categorize") {
      const items = a.items || []
      return (
        items.length > 0 &&
        items.every(
          (it) =>
            it.categoryId !== null && it.categoryId !== undefined
        )
      )
    }

    if (q.type === "cloze") {
      // Use the current answer's blanks, not the original meta
      const blanks = a.blanks || [];
      const ua = a.userAnswers || {};
      // Debug log
      console.log('isQuestionAnswered cloze:', { blanks, userAnswers: ua });
      // all blanks must have non-empty string values, compare IDs as strings
      return (
        blanks.length > 0 &&
        blanks.every(
          (b) =>
            typeof ua[String(b.id)] === "string" &&
            ua[String(b.id)].trim() !== ""
        )
      );
    }

    if (q.type === "comprehension") {
      const subs = q.meta?.subQuestions || []
      const ans = a.answers || {}
      if (subs.length === 0) return false
      return subs.every((s) =>
        s.kind === "mcq"
          ? !!ans[s.id]
          : typeof ans[s.id] === "string" &&
            ans[s.id].trim() !== ""
      )
    }

    return false
  }

  const total = form?.questions?.length || 0
  const answeredCount = useMemo(() => {
    if (!form) return 0
    return form.questions.reduce(
      (acc, q) => acc + (isQuestionAnswered(q) ? 1 : 0),
      0
    )
  }, [form, answers])
  const remaining = Math.max(0, total - answeredCount)
  const allAnswered = total > 0 && answeredCount === total

  const submit = async () => {
    if (!allAnswered || submitting || submitted) return
    setSubmitting(true)
    setError("")
    try {
      const payload = {
        formId,
        answers: Object.entries(answers).map(([qid, v]) => ({
          questionId: qid,
          value: v
        }))
      }
      await submitResponse(payload)
      setSubmitted(true)
    } catch (e) {
      console.error(e)
      setError("Failed to submit responses")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">Loading...</div>
    )
  if (!form)
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        {error || "Not found"}
      </div>
    )

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          {form.title}
        </h1>
        {form.headerImage && (
          <img
            src={
              resolveImageUrl(form.headerImage) ||
              "/placeholder.svg"
            }
            alt="Header"
            className="rounded border max-h-48"
          />
        )}
      </div>

      {/* Progress */}
      <div className="bg-white border rounded p-3 shadow-sm">
        <div className="text-sm text-slate-700">
          Answered:{" "}
          <span className="font-medium text-emerald-700">
            {answeredCount}
          </span>{" "}
          / {total}{" "}
          {remaining > 0
            ? `(Remaining: ${remaining})`
            : "(All answered)"}
        </div>
        <div className="mt-2 h-2 w-full bg-slate-200 rounded overflow-hidden">
          <div
            className="h-full bg-emerald-600"
            style={{
              width: `${
                total ? (answeredCount / total) * 100 : 0
              }%`
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {form.questions.map((q, qIdx) => (
          <div
            key={q._id}
            className="border rounded p-4 space-y-3 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 capitalize">
                {q.type}
              </div>
              <div
                className={`text-xs px-2 py-0.5 rounded ${
                  isQuestionAnswered(q)
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isQuestionAnswered(q) ? "Answered" : "Pending"}
              </div>
            </div>
            <div className="font-medium text-slate-900">
              {`Q${qIdx + 1}. ${q.questionText}`}
            </div>
            {q.questionImage && (
              <img
                src={
                  resolveImageUrl(q.questionImage) ||
                  "/placeholder.svg"
                }
                alt="Question"
                className="rounded border max-h-48"
              />
            )}

            {q.type === "categorize" && (
              <CategorizeViewer
                meta={answers[q._id]}
                onChange={(m) => setAns(q._id, m)}
              />
            )}
            {q.type === "cloze" && (
              <ClozeViewer
                meta={answers[q._id]}
                onChange={(m) => setAns(q._id, m)}
              />
            )}
            {q.type === "comprehension" && (
              <ComprehensionViewer
                meta={answers[q._id]}
                onChange={(m) => setAns(q._id, m)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-60 hover:bg-emerald-700"
          onClick={submit}
          disabled={!allAnswered || submitting || submitted}
          title={
            !allAnswered
              ? "Answer all questions to submit"
              : ""
          }
        >
          {submitted
            ? "Submitted"
            : submitting
            ? "Submitting..."
            : "Submit response"}
        </button>
        {error && (
          <span className="text-sm text-rose-600">{error}</span>
        )}
        {submitted && (
          <span className="text-sm text-emerald-700">
            Thank you! Your response has been recorded.
          </span>
        )}
      </div>
    </div>
  )
}
