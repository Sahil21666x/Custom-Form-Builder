# Custom Form Builder (MERN + Vite + Tailwind)

An end-to-end Custom Form Builder with:
- Form builder UI (drag-and-drop) with three question types:
  - Categorize (drag items into categories)
  - Cloze (fill-in-the-blanks)
  - Comprehension (passage + MCQ/short answers)
- Image uploads for form header and individual questions
- Form preview and a public fill link
- MongoDB persistence for forms and responses

Tech:
- Frontend: React (Vite) + Tailwind CSS + @hello-pangea/dnd + React Router + Axios
- Backend: Node.js + Express + Multer + Mongoose + CORS
- DB: MongoDB (Atlas recommended)

Note: We use Vite as suggested by the official React docs for building React apps from scratch [^2].

## Project Structure

- client/ (Vite React app)
- server/ (Express API + MongoDB + file uploads)

## Prerequisites

- Node.js 18+
- MongoDB Atlas connection string (or local MongoDB)

## Setup

1) Server
- Copy server/.env.example to server/.env and set MONGODB_URI and PORT as needed.
- Install and run:
  cd server
  npm install
  npm run dev

2) Client
- Create a .env file in client/ to point to your API (optional, defaults to http://localhost:5000):
  VITE_API_URL=http://localhost:5000
- Install and run:
  cd client
  npm install
  npm run dev

Open http://localhost:5173

## Development Notes

- Image uploads: Files are stored locally under server/uploads/ and served at /uploads/... in development.

- Public fill link:
  After saving a form, you’ll get an ID. The fill URL is:
  http://localhost:5173/fill/{formId}

- Validation: Basic validations are included client- and server-side. File upload is limited to images < 5MB.

## Scripts

- server: npm run dev (nodemon)
- client: npm run dev (Vite)

## Deploy

- Frontend: Vercel (build with Vite)
- Backend: Render (Node + Express)
- Database: MongoDB Atlas

Update client VITE_API_URL to your deployed API URL for production.

## Success Criteria Mapping

- 3 custom question types implemented
- Images for header and questions via /api/upload
- Preview + public fill link
- MongoDB models for forms and responses
- Responsive Tailwind UI
