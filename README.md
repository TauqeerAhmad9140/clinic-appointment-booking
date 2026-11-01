# Clinic Appointment Booking

A beginner-friendly MERN starter for clinic appointments.

## Stack
- Frontend: React + Vite, React Router, Axios, plain CSS
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs
- Tests: Node's built-in test runner + Supertest

## Setup

### 1. Backend
```bash
cd server
npm install
copy .env.example .env
```
Open `server/.env` and set `MONGO_URI` to your MongoDB Atlas connection string and change `JWT_SECRET` to a long random value.

Seed demo doctors:
```bash
npm run seed
```
Start API:
```bash
npm run dev
```
API runs at `http://localhost:5000`.

### 2. Frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown (usually `http://localhost:5173`).

## Demo data
The seed script creates three doctor profiles:
- Dr. Aisha Khan — Cardiology
- Dr. Rahul Sharma — Dermatology
- Dr. Neha Verma — General Medicine

The seed script does not create a demo patient account. Register through the UI.

## Main features
- Patient registration and login
- Browse doctors and specialties
- Weekly availability per doctor
- Find available slots for a selected date
- Book an appointment
- Patient dashboard with upcoming/past appointments
- Cancel appointments, subject to the 2-hour rule
- Doctor dashboard to view today's appointments and mark completed/no-show
- Server-side validation and basic collision prevention
- Responsive UI

## Important design notes
- Appointment dates are stored as JavaScript dates in MongoDB.
- The booking endpoint checks for an existing booked appointment for the doctor and exact start time before creating one. The database also has a unique partial index for doctor + start time for booked appointments.
- In production, consider transactions and retry handling for race conditions, and use a replica set if you rely on MongoDB transactions.
- This is a starter assignment project, not a production medical system. Add rate limiting, email verification, audit logs, stronger role management, and deployment secrets before real-world use.

## Environment
See `server/.env.example`. Never commit `.env`.

## Tests
```bash
cd server
npm test
```
The included tests cover basic validation helpers. For full integration tests, configure a test MongoDB database and expand the suite.

## AI tools used
Disclose any AI assistance you used while building or modifying this project, according to the assignment rules.

## Known limitations / next steps
- Rescheduling can be done by cancelling and booking another slot; a dedicated reschedule UI can be added.
- Doctor leave management and reminders are not included.
- Add pagination, richer error messages, and integration tests before submission.
