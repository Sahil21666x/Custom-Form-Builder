import { Routes, Route, Link, useNavigate } from "react-router-dom"
import Builder from "./pages/Builder.jsx"
import Preview from "./pages/Preview.jsx"
import Fill from "./pages/Fill.jsx"
import Forms from "./pages/Forms.jsx"

export default function App() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            Custom Form Builder
          </Link>
          <nav className="flex items-center gap-3">
            <Link className="text-sm/none hover:underline" to="/">Builder</Link>
            <Link className="text-sm/none hover:underline" to="/forms">Forms</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-slate-50">
        <Routes>
          <Route path="/" element={<Builder />} />
          <Route path="/preview/:formId" element={<Preview />} />
          <Route path="/fill/:formId" element={<Fill />} />
          <Route path="/forms" element={<Forms />} />
        </Routes>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 h-12 text-xs text-gray-500 flex items-center">
          {'© '} {new Date().getFullYear()} {' Form Builder'}
        </div>
      </footer>
    </div>
  )
}
