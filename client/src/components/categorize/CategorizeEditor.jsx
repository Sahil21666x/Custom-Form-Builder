import { useMemo, useState } from "react"

export default function CategorizeEditor({ value, onChange }) {
  const [categoryName, setCategoryName] = useState("")
  const [itemLabel, setItemLabel] = useState("")
  const meta = value || { categories: [], items: [] }

  const byId = useMemo(() => {
    const map = new Map()
    meta.categories.forEach((c) => map.set(c.id, c))
    return map
  }, [meta.categories])

  const addCategory = () => {
    if (!categoryName.trim()) return
    const newCat = { id: String(Date.now()), name: categoryName.trim() }
    onChange({ ...meta, categories: [...meta.categories, newCat] })
    setCategoryName("")
  }

  const removeCategory = (id) => {
    const remainingCats = meta.categories.filter((c) => c.id !== id)
    const remapItems = meta.items.map((it) =>
      it.categoryId === id ? { ...it, categoryId: null } : it
    )
    onChange({ ...meta, categories: remainingCats, items: remapItems })
  }

  const addItem = () => {
    if (!itemLabel.trim()) return
    const newItem = { id: String(Date.now()), label: itemLabel.trim(), categoryId: null }
    onChange({ ...meta, items: [...meta.items, newItem] })
    setItemLabel("")
  }

  const updateItem = (id, patch) => {
    const next = meta.items.map((it) => (it.id === id ? { ...it, ...patch } : it))
    onChange({ ...meta, items: next })
  }

  const removeItem = (id) => {
    onChange({ ...meta, items: meta.items.filter((i) => i.id !== id) })
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-3 bg-slate-50">
          <div className="text-sm font-medium text-slate-800">Categories</div>
          <div className="mt-2 flex gap-2">
            <input
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="e.g., Animals"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <button
              className="px-3 py-2 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={addCategory}
            >
              Add
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {meta.categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between bg-white border rounded px-3 py-2"
              >
                <span className="text-sm text-slate-900">{c.name}</span>
                <button
                  className="text-xs text-rose-600"
                  onClick={() => removeCategory(c.id)}
                >
                  Remove
                </button>
              </li>
            ))}
            {meta.categories.length === 0 && (
              <li className="text-xs text-slate-500">No categories yet.</li>
            )}
          </ul>
        </div>

        <div className="border rounded p-3 bg-slate-50">
          <div className="text-sm font-medium text-slate-800">Items</div>
          <div className="mt-2 flex gap-2">
            <input
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="e.g., Dog"
              value={itemLabel}
              onChange={(e) => setItemLabel(e.target.value)}
            />
            <button
              className="px-3 py-2 rounded text-sm bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={addItem}
            >
              Add
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {meta.items.map((it) => (
              <div
                key={it.id}
                className="grid sm:grid-cols-[1fr_180px_80px] gap-2 items-center bg-white border rounded px-3 py-2"
              >
                <input
                  className="border rounded px-2 py-1 text-sm w-full"
                  value={it.label}
                  onChange={(e) => updateItem(it.id, { label: e.target.value })}
                />
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={it.categoryId || ""}
                  onChange={(e) =>
                    updateItem(it.id, { categoryId: e.target.value || null })
                  }
                >
                  <option value="">Unassigned</option>
                  {meta.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  className="text-xs text-rose-600"
                  onClick={() => removeItem(it.id)}
                >
                  Remove
                </button>
              </div>
            ))}
            {meta.items.length === 0 && (
              <div className="text-xs text-slate-500">No items yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded p-3 bg-white">
        <div className="text-sm font-medium text-slate-800 mb-2">
          Summary (correct mapping preview)
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="border rounded p-2 bg-slate-50">
            <div className="text-xs font-medium text-slate-700 mb-1">Unassigned</div>
            <ul className="text-sm">
              {meta.items.filter((i) => !i.categoryId).map((i) => (
                <li key={i.id} className="py-0.5">{i.label}</li>
              ))}
            </ul>
          </div>
          {meta.categories.map((c) => (
            <div key={c.id} className="border rounded p-2 bg-slate-50">
              <div className="text-xs font-medium text-slate-700 mb-1">{c.name}</div>
              <ul className="text-sm">
                {meta.items.filter((i) => i.categoryId === c.id).map((i) => (
                  <li key={i.id} className="py-0.5">{i.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
