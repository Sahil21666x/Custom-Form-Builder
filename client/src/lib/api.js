import axios from "axios"

export const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const api = axios.create({
  baseURL,
  withCredentials: false
})

// Helper: ensure images from /uploads work across ports
export function resolveImageUrl(url) {
  if (!url) return ""
  if (url.startsWith("http")) return url
  if (url.startsWith("/uploads")) return `${baseURL}${url}`
  return url
}

// Forms
export const createForm = (payload) => api.post("/api/forms", payload)
export const getForm = (id) => api.get(`/api/forms/${id}`)
export const listForms = () => api.get(`/api/forms`)

// Upload
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append("image", file)
  const res = await api.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

// Responses
export const submitResponse = (payload) => api.post("/api/responses", payload)
