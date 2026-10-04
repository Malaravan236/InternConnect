# Internship Management System (React + Django + MongoDB)

Original project: React + TypeScript + Firebase.
This version: **JavaScript (JSX)** frontend, **Django REST** backend, **MongoDB** database.

```
frontend/   React (Vite, Tailwind) - plain JS/JSX
backend/    Django + DRF + pymongo (JWT auth, file uploads, email)
docker-compose.yml   optional local MongoDB
```

## 1. MongoDB
Install MongoDB locally, or: `docker compose up -d`

## 2. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # edit secrets / MONGO_URI
python manage.py runserver                            # http://localhost:8000
```

## 3. Frontend
```bash
cd frontend
cp .env.example .env                                  # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev                                           # http://localhost:5173
```

## Admin
Same as the original app: the account with email `admin@gmail.com` is the admin
(change with `ADMIN_EMAIL` in `backend/.env`). Sign up with that email first.

## How Firebase was replaced
| Firebase | Now |
|---|---|
| Firebase Auth | Django `/api/auth/*` (JWT, PBKDF2 password hashes) |
| Firestore | MongoDB collections via `/api/db/<collection>/` |
| Storage | `/api/files/upload/` (saved in `backend/media/`) |
| Cloud Functions email | `/api/email/acceptance/` (Django `send_mail`) |

The pages still call `getDocs`, `addDoc`, `onSnapshot`... but those now come from
`frontend/src/api/` (a small Firestore-style layer over the REST API),
so page logic did not need rewriting. `onSnapshot` refreshes every 5 s and after your own writes.

## Notes
- Emails print in the Django console until `EMAIL_HOST*` is set in `.env`.
- Password-reset link goes to `/reset-password?token=...`; this page is not in the original UI yet
  (the API `POST /api/auth/password-reset/confirm/` is ready).
- Google sign-in is disabled (needs Google OAuth client setup).
- Write permissions are enforced in `backend/api/views.py` (`can_write`).
