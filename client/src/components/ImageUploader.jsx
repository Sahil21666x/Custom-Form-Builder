import { useRef, useState } from "react"
import { uploadImage } from "../lib/api"

export default function ImageUploader({ label = "Upload image", onUploaded, className = "" }) {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB limit.")
      return
    }
    setLoading(true)
    try {
      const { url } = await uploadImage(file)
      onUploaded?.(url)
    } catch (err) {
      setError("Upload failed. Try again.")
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-white hover:file:bg-gray-50"
        />
        {loading && <span className="text-xs text-gray-500">Uploading...</span>}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
