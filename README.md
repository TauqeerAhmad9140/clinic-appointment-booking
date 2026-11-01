# CarePoint – Clinic Appointment Booking System

CarePoint is a MERN-stack web application for booking and managing clinic appointments. Patients can find doctors, view available time slots, and manage their appointments. Doctors can manage their weekly availability, block leave dates, and update appointment statuses.

## Features

### Patient
- Register and log in to a patient account.
- Browse and search doctors by name or specialty.
- View available appointment slots for a selected date.
- Book appointments with a doctor.
- View upcoming and past appointments.
- Cancel or reschedule booked appointments.
- Cancellation and rescheduling are restricted within two hours of the appointment start time.

### Doctor
- Log in to a doctor account.
- View appointments scheduled for the current day.
- Mark booked appointments as **Completed** or **No-show**.
- Manage weekly working hours from the doctor dashboard.
- Choose an appointment slot duration of 15 or 30 minutes.
- Block a date as leave and remove a previously blocked leave date.

### Booking rules
- Patients can only book future appointment slots.
- Available slots are generated from each doctor's weekly schedule.
- Booked slots are not offered to other patients.
- A MongoDB unique partial index protects against duplicate bookings for the same doctor and start time.
- Doctor leave dates are excluded from slot availability and checked by the booking endpoint.
- A doctor cannot block a date that already has booked appointments.

## Tech Stack

**Frontend**
- React 18
- Vite
- React Router
- Axios
- Lucide React
- CSS

**Backend**
- Node.js
- Express
- MongoDB and Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv

## Project Structure

```text
clinic-appointment-booking/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── seed.js
│   │   ├── seedDoctors.js
│   │   └── server.js
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- A MongoDB Atlas cluster (or another reachable MongoDB instance)
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/TauqeerAhmad9140/clinic-appointment-booking.git
cd clinic-appointment-booking
```

### 2. Configure and start the backend

```bash
cd server
npm install
```

Create a file named `.env` inside the `server` folder and add your own values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Do not commit this `.env` file. Use your own MongoDB credentials and a new secret.

Seed the three demo doctor accounts and profiles:

```bash
node src/seedDoctors.js
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Configure and start the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Demo Doctor Accounts

Run `node src/seedDoctors.js` from the `server` directory after configuring `server/.env`.

| Doctor | Specialty | Email |
|---|---|---|
| Dr. Ayesha Khan | Cardiologist | `dr.ayesha@example.com` |
| Dr. Rahul Verma | Dermatologist | `dr.rahul@example.com` |
| Dr. Neha Sharma | General Physician | `dr.neha@example.com` |

**Demo password for all three accounts:** `Doctor@123`

These are local demonstration accounts only. Do not use this shared password for real users or in a production deployment. Patients can create an account through the registration page.

## Tests

Run the backend's included tests from the `server` directory:

```bash
npm test
```

The current test suite includes basic validation tests. Manual end-to-end testing of booking, cancellation, rescheduling, availability, leave dates, and doctor appointment status is also recommended.

## Security and Production Notes

- Never commit `.env`, database credentials, or private keys.
- The demo doctor credentials are for local evaluation only.
- This project is an academic/demo application, not a production-ready medical records system.
- Before real-world use, add stronger account provisioning, rate limiting, email verification, audit logging, monitoring, secure deployment configuration, and broader automated integration tests.

## Author

**Tauqeer Ahmad**

- GitHub: [TauqeerAhmad9140](https://github.com/TauqeerAhmad9140)
- Repository: [CarePoint – Clinic Appointment Booking System](https://github.com/TauqeerAhmad9140/clinic-appointment-booking)

## Acknowledgement

AI assistance was used for parts of development support, debugging guidance, and documentation.
