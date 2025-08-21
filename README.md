# Form Builder Application  

A dynamic, customizable **form builder application** built with **Next.js (frontend)** and **Go Fiber + MongoDB (backend)**. The project demonstrates full-stack skills by enabling users to:  

- Create forms with text, multiple choice, checkboxes, and rating fields.  
- Save drafts and publish forms with a unique slug.  
- Share forms publicly to collect responses.  
- View **real-time analytics** of responses through a live dashboard.  

---

## Live Demo  

- **Frontend (Next.js on Vercel):**  
  [https://dune-security-assignment.vercel.app/forms/new](https://dune-security-assignment.vercel.app/forms/new)  

- **Backend Health (Go Fiber on Render):**  
  [https://dune-security-assignment-h89s.onrender.com/healthz](https://dune-security-assignment-h89s.onrender.com/healthz)  

> ⚠️ Note: The backend API is running, but integration between frontend (Vercel) and backend (Render) is not fully stable due to deployment configuration and time constraints. Forms UI works, but some API calls may return intermittent errors.  

---

## 🛠️ Getting Started  

### 1. Clone the repo  

```bash
git clone https://github.com/<your-username>/dune-security-assignment.git
cd dune-security-assignment

2. Install dependencies
npm install
# or
yarn install

3. Run the frontend (Next.js)
npm run dev

4. Run the backend (Go Fiber)
cd backend
go run main.go
Backend runs at http://localhost:8080.

⚙️Environment Variables
Create a .env.local file in the frontend root with:
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_API_KEY=demo-key

For backend (.env):
MONGO_URI=<your-mongodb-uri>
ALLOWED_ORIGINS=http://localhost:3000,https://dune-security-assignment.vercel.app
PORT=8080


📊 Features

Form Builder UI – Add text, multiple choice, checkbox, rating fields.

Draft & Publish – Save drafts locally and publish with custom slug.

Public Form Sharing – Access via unique /public/:slug link.

Responses – Users can submit responses stored in MongoDB.

Analytics Dashboard – Real-time analytics with in-memory pub/sub.


3.2 Challenges

Schema & Validation: strict field-level validation while keeping flexibility.

Database Design: creating indexes for fast form retrieval + analytics.

Real-Time Analytics: efficient pub/sub handling for live dashboards.

API Contracts: syncing backend payloads with frontend expectations.

CORS & Origins: cross-platform communication between Vercel & Render.

Environment Variables: consistent handling across dev, Render, and Vercel.

Deployment Issues: integration stable locally but intermittent in production.

Time Constraints: some deployment issues remain unresolved despite best effort.


📖 Documentation
Setup locally: Follow steps above to run frontend + backend.

Assumptions:

Responses are anonymous.

Basic pub/sub is in-memory (not Redis).

Minimal error handling added due to time.

How to test analytics:

Open the form’s public URL in one tab.

Submit responses.

Watch analytics update live in another tab.


📚 Learnings
Gained experience in handling cross-platform deployments (Render + Vercel).

Importance of consistent API contracts between frontend & backend.

Trade-offs between time constraints and complete production stability.
