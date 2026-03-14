# Trufit SQS - Frontend Management System

## 🛠 Tech Stack

- **Framework:** React 18 + TypeScript (Vite)
- **Routing:** React Router v6
- **Backend/Auth:** Supabase
- **Database Schema:** Relational (Employees -> UserCredentials -> Roles)

## 🔐 Authentication & Security

- **Public Access:** Only `/home` and `/webapp/login` are accessible without a session.
- **Route Protection:** All internal routes are wrapped in `<ProtectedRoute />`.
- **Role-Based Access (RBAC):** The Dashboard adapts its UI based on the `role` integer/string fetched from the `UserCredentials` join.

## 📁 Folder Structure

- `src/context/`: Contains `AuthContext.tsx` (Global session state).
- `src/lib/`: Contains `supabaseClient.ts` (DB Connection).
- `src/pages/internal/`: Dashboard and Department-specific tools.
- `src/pages/public/`: Customer-facing landing pages.

## 🚀 Getting Started

1. `cd frontend`
2. `npm install`
3. Create a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. `npm run dev`

## 📝 Implementation Notes for Devs

- When querying the login, perform a join between `UserCredentials` and `Roles` to get the `role_name`.
- Use the `useAuth()` hook to access the current user's role anywhere in the app.
- Reference the DB Schema diagram for Foreign Key relationships between Employee IDs and Credentials.
