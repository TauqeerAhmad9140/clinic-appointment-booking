import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  Clock3,
  LogIn,
  LogOut,
  Menu,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import api from "./api";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("clinic_user") || "null");
  } catch {
    return null;
  }
}
function Header({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="container nav-wrap">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Activity size={20} />
          </span>
          CarePoint
        </Link>
        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav open" : "nav"}>
          <NavLink to="/" onClick={() => setOpen(false)}>
            Find a doctor
          </NavLink>
          {user?.role === "patient" && (
            <NavLink to="/dashboard" onClick={() => setOpen(false)}>
              My appointments
            </NavLink>
          )}
          {user?.role === "doctor" && (
            <NavLink to="/doctor" onClick={() => setOpen(false)}>
              Doctor dashboard
            </NavLink>
          )}
          {user ? (
            <button className="nav-logout" onClick={onLogout}>
              <LogOut size={16} /> Sign out
            </button>
          ) : (
            <NavLink
              className="nav-login"
              to="/login"
              onClick={() => setOpen(false)}
            >
              <LogIn size={16} /> Log in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
function Notice({ children, type = "error" }) {
  return children ? <div className={`notice ${type}`}>{children}</div> : null;
}
function AuthPage({ mode, onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const register = mode === "register";
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post(
        `/auth/${register ? "register" : "login"}`,
        form,
      );
      onAuth(data);
      navigate(data.user.role === "doctor" ? "/doctor" : "/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not connect to the server. Is the backend running?",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-icon">
          <UserRound size={25} />
        </div>
        <p className="eyebrow">WELCOME TO CAREPOINT</p>
        <h1>{register ? "Create your account" : "Welcome back"}</h1>
        <p className="muted">
          {register
            ? "Create a patient account to book visits."
            : "Log in to manage your appointments."}
        </p>
        <Notice>{error}</Notice>
        <form onSubmit={submit} className="form">
          {register && (
            <label>
              Full name
              <input
                required
                maxLength="80"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              minLength="8"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
            />
          </label>
          <button className="btn primary full" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create account" : "Log in"}
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to CarePoint?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Log in" : "Create account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
function Home({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [specialty, setSpecialty] = useState("All specialties");
  const [query, setQuery] = useState("");
  useEffect(() => {
    api
      .get("/doctors")
      .then((r) => setDoctors(r.data))
      .catch(() =>
        setError(
          "Can't load doctors yet. Start the backend and connect MongoDB, then refresh this page.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  const specialties = [
    "All specialties",
    ...new Set(doctors.map((d) => d.specialty)),
  ];
  const filtered = doctors.filter(
    (d) =>
      (specialty === "All specialties" || d.specialty === specialty) &&
      `${d.name} ${d.specialty}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="pill">
              <span className="pulse" /> YOUR HEALTH, MADE SIMPLE
            </span>
            <h1>
              Care that fits
              <br />
              <span>your schedule.</span>
            </h1>
            <p>
              Find trusted doctors and book an appointment in just a few clicks.
              Better care starts here.
            </p>
            <div className="hero-actions">
              <a href="#doctors" className="btn primary">
                Find your doctor <span>↗</span>
              </a>
              <div className="trust">
                <span className="trust-icon">
                  <Stethoscope size={18} />
                </span>
                <span>
                  <b>Simple & secure</b>
                  <small>Appointment booking</small>
                </span>
              </div>
            </div>
          </div>
          
          <div className="hero-art">
            <div className="art-circle">
              <div className="doctor-emoji">🩺</div>
              <div className="art-cross">+</div>
              <div className="art-card">
                <span className="mini-check">✓</span>
                <span>
                  <b>Appointments made easy</b>
                  <small>Care, on your time</small>
                </span>
              </div>
              <div className="art-dot dot-one" />
              <div className="art-dot dot-two" />
            </div>
          </div>
        </div>
      </section>
      <section className="stats-strip">
        <div className="container stats">
          <div>
            <b>Easy booking</b>
            <span>Choose a time that works</span>
          </div>
          <div>
            <b>Trusted specialists</b>
            <span>Find care for your needs</span>
          </div>
          <div>
            <b>Stay organised</b>
            <span>Appointments in one place</span>
          </div>
        </div>
      </section>
      <main className="container doctors-section" id="doctors">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR MEDICAL TEAM</p>
            <h2>Meet our doctors</h2>
            <p className="muted">
              Choose a specialist and find an available appointment.
            </p>
          </div>
          <span className="doctor-count">
            <Stethoscope size={16} /> {doctors.length} specialists
          </span>
        </div>
        <div className="filters">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctor or specialty…"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            {specialties.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        {error && <Notice>{error}</Notice>}
        {loading ? (
          <p className="muted">Loading doctors…</p>
        ) : (
          <div className="doctor-grid">
            {filtered.map((doctor, i) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                index={i}
                user={user}
              />
            ))}
            {!filtered.length && (
              <div className="empty">No doctors match your search.</div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
function DoctorCard({ doctor, index, user }) {
  const colors = ["mint", "blue", "peach"];
  const initials = doctor.name
    .replace("Dr. ", "")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
  return (
    <article className="doctor-card">
      <div className={`doctor-avatar ${colors[index % colors.length]}`}>
        <span>{initials}</span>
        <i>
          <Stethoscope size={15} />
        </i>
      </div>
      <div className="doctor-info">
        <span className="specialty">{doctor.specialty}</span>
        <h3>{doctor.name}</h3>
        <p>{doctor.bio || "Committed to helping you feel your best."}</p>
        <div className="doctor-meta">
          <span>
            <Clock3 size={15} /> {doctor.slotMinutes} min visits
          </span>
          <span>
            <CalendarDays size={15} /> Weekly schedule
          </span>
        </div>
        <Link
          className="btn outline full"
          to={user ? `/book/${doctor._id}` : "/login"}
        >
          Book appointment <span>→</span>
        </Link>
      </div>
    </article>
  );
}
function BookPage() {
  const navigate = useNavigate();
  const id = window.location.pathname.split("/").pop();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000).toLocaleDateString("en-CA"),
  );
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api
      .get("/doctors")
      .then((r) => setDoctor(r.data.find((d) => d._id === id) || null))
      .catch(() => setError("Could not load doctor."));
  }, [id]);
  useEffect(() => {
    setSelected("");
    setSuccess("");
    api
      .get(`/doctors/${id}/slots`, { params: { date } })
      .then((r) => setSlots(r.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load slots."),
      );
  }, [id, date]);
  async function book() {
    if (!selected) return setError("Choose a time slot first.");
    setError("");
    setBusy(true);
    try {
      await api.post("/appointments", {
        doctorId: id,
        start: selected,
        reason,
      });
      setSuccess("Appointment booked successfully!");
      setSelected("");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Could not book appointment.");
    } finally {
      setBusy(false);
    }
  }
  if (!doctor)
    return (
      <main className="container page">
        <h1>Book an appointment</h1>
        <p className="muted">Loading doctor details…</p>
        <Notice>{error}</Notice>
      </main>
    );
  return (
    <main className="container page">
      <Link className="back-link" to="/">
        ← Back to doctors
      </Link>
      <div className="booking-layout">
        <section className="panel booking-main">
          <p className="eyebrow">BOOK A VISIT</p>
          <h1>Choose your appointment</h1>
          <div className="selected-doctor">
            <div className="doctor-avatar mint">
              <span>
                {doctor.name
                  .replace("Dr. ", "")
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            </div>
            <div>
              <h3>{doctor.name}</h3>
              <p>
                {doctor.specialty} · {doctor.slotMinutes} minutes
              </p>
            </div>
          </div>
          <label className="date-label">
            Appointment date
            <input
              type="date"
              min={new Date().toLocaleDateString("en-CA")}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <div className="slot-heading">
            <h3>Available times</h3>
            <span>{slots.length} slots</span>
          </div>
          <div className="slots">
            {slots.map((slot) => (
              <button
                key={slot.start}
                className={selected === slot.start ? "slot selected" : "slot"}
                onClick={() => setSelected(slot.start)}
              >
                {new Date(slot.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </button>
            ))}
          </div>
          {!slots.length && (
            <p className="muted small">
              No slots available for this date. Try another day.
            </p>
          )}
          <label className="date-label">
            Reason for visit{" "}
            <textarea
              maxLength="500"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional: briefly describe your concern"
            />
          </label>
          <Notice>{error}</Notice>
          <Notice type="success">{success}</Notice>
          <button
            className="btn primary full"
            disabled={!selected || busy}
            onClick={book}
          >
            {busy ? "Booking…" : "Confirm appointment"}
          </button>
        </section>
        <aside className="panel booking-aside">
          <div className="aside-icon">
            <CalendarDays />
          </div>
          <h3>Before you book</h3>
          <ul>
            <li>Choose a date and an available time.</li>
            <li>
              Appointments are booked in {doctor.slotMinutes}-minute slots.
            </li>
            <li>
              Cancellation is unavailable within 2 hours of the appointment.
            </li>
          </ul>
          <div className="aside-note">
            Please arrive a few minutes before your scheduled visit.
          </div>
        </aside>
      </div>
    </main>
  );
}
function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    api
      .get("/appointments/mine")
      .then((r) => setAppointments(r.data))
      .catch((e) =>
        setError(e.response?.data?.message || "Unable to load appointments."),
      );
  }, [reload]);
  async function cancel(id) {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      setReload((v) => v + 1);
    } catch (e) {
      setError(e.response?.data?.message || "Could not cancel appointment.");
    }
  }
  const now = Date.now();
  const upcoming = appointments.filter(
    (a) => a.status === "booked" && new Date(a.start).getTime() >= now,
  );
  const past = appointments.filter(
    (a) => a.status !== "booked" || new Date(a.start).getTime() < now,
  );
  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PATIENT SPACE</p>
          <h1>My appointments</h1>
          <p className="muted">Your visits, all in one place.</p>
        </div>
        <Link className="btn primary" to="/">
          + Book a visit
        </Link>
      </div>
      <Notice>{error}</Notice>
      <section className="panel list-panel">
        <h2>
          Upcoming visits <span className="count">{upcoming.length}</span>
        </h2>
        {upcoming.length ? (
          upcoming.map((a) => (
            <AppointmentRow
              key={a._id}
              appointment={a}
              onCancel={cancel}
              onReschedule={() => setReload((v) => v + 1)}
            />
          ))
        ) : (
          <EmptyState
            title="No upcoming appointments"
            text="When you book a visit, it will appear here."
          />
        )}
      </section>
      <section className="panel list-panel">
        <h2>
          Past appointments <span className="count">{past.length}</span>
        </h2>
        {past.length ? (
          past.map((a) => <AppointmentRow key={a._id} appointment={a} />)
        ) : (
          <EmptyState
            title="Nothing here yet"
            text="Your past visits will show up here."
          />
        )}
      </section>
    </main>
  );
}


function AppointmentRow({ appointment: a, onCancel, onReschedule }) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slotError, setSlotError] = useState("");

  const doctorId = a.doctor?._id;

  const [date, setDate] = useState(() => {
    const d = new Date(a.start);
    return `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Load available slots when the reschedule panel opens or date changes
  useEffect(() => {
    if (!showReschedule || !doctorId || !date) return;

    let active = true;

    setLoadingSlots(true);
    setSlotError("");
    setSlots([]);
    setSelected("");

    api
      .get(`/doctors/${doctorId}/slots`, { params: { date } })
      .then((r) => {
        if (active) setSlots(r.data);
      })
      .catch((err) => {
        if (active) {
          setSlotError(
            err.response?.data?.message || "Could not load available slots."
          );
        }
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [showReschedule, date, doctorId]);

  async function submitReschedule() {
    if (!selected) {
      setSlotError("Please select a new time slot.");
      return;
    }

    setSaving(true);
    setSlotError("");

    try {
      await api.patch(`/appointments/${a._id}/reschedule`, {
        start: selected,
      });

      setShowReschedule(false);
      onReschedule?.();
    } catch (err) {
      setSlotError(
        err.response?.data?.message || "Could not reschedule appointment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="appointment-row">
        <div className="appointment-date">
          <b>
            {new Date(a.start).toLocaleDateString([], { day: "2-digit" })}
          </b>
          <span>
            {new Date(a.start).toLocaleDateString([], { month: "short" })}
          </span>
        </div>

        <div className="appointment-details">
          <h3>{a.doctor?.name || "Doctor"}</h3>
          <p>{a.doctor?.specialty || ""}</p>
          <span>
            <CalendarDays size={14} />
            {new Date(a.start).toLocaleDateString([], {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            {" · "}
            {new Date(a.start).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="appointment-actions">
          <span className={`status ${a.status}`}>{a.status}</span>

          {onCancel && a.status === "booked" && (
            <>
              <button
                type="button"
                className="text-button"
                onClick={() => setShowReschedule((v) => !v)}
              >
                {showReschedule ? "Close" : "Reschedule"}
              </button>

              <button
                type="button"
                className="text-button"
                onClick={() => onCancel(a._id)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {showReschedule && (
        <section className="panel" style={{ marginTop: "12px" }}>
          <h3>Reschedule appointment</h3>
          <p className="muted">
            Choose a new date and an available time.
          </p>

          <label className="date-label">
            New appointment date
            <input
              type="date"
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <div className="slot-heading">
            <h3>Available times</h3>
            <span>{slots.length} slots</span>
          </div>

          {loadingSlots ? (
            <p className="muted small">Loading available slots...</p>
          ) : (
            <div className="slots">
              {slots.map((slot) => (
                <button
                  type="button"
                  key={slot.start}
                  className={
                    selected === slot.start ? "slot selected" : "slot"
                  }
                  onClick={() => setSelected(slot.start)}
                >
                  {new Date(slot.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </button>
              ))}
            </div>
          )}

          {!loadingSlots && !slots.length && (
            <p className="muted small">
              No slots available for this date. Try another day.
            </p>
          )}

          <Notice>{slotError}</Notice>

          <button
            type="button"
            className="btn primary full"
            disabled={!selected || saving || loadingSlots}
            onClick={submitReschedule}
          >
            {saving ? "Rescheduling..." : "Confirm new appointment"}
          </button>
        </section>
      )}
    </>
  );
}


function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <CalendarDays />
      </div>
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}


function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const [leaveDate, setLeaveDate] = useState("");
  const [leaveDates, setLeaveDates] = useState([]);
  const [leaveError, setLeaveError] = useState("");
  const [leaveMessage, setLeaveMessage] = useState("");
  const [leaveBusy, setLeaveBusy] = useState(false);
  
  const [availability, setAvailability] = useState({
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
});

const [slotMinutes, setSlotMinutes] = useState(30);
const [availabilityBusy, setAvailabilityBusy] = useState(false);
const [availabilityError, setAvailabilityError] = useState("");
const [availabilityMessage, setAvailabilityMessage] = useState("");

const weekDays = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];


  const now = new Date();
  const minDate = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Fetch today's appointments
  useEffect(() => {
    api
      .get("/appointments/today")
      .then((r) => setAppointments(r.data))
      .catch((e) =>
        setError(
          e.response?.data?.message ||
            "Doctor dashboard could not load."
        )
      );
  }, [reload]);

  // Fetch doctor's saved leave dates

useEffect(() => {
  api
    .get("/doctors/me/profile")
    .then((r) => {
      setLeaveDates(r.data.leaveDates || []);

      const saved = r.data.availability || {};

      setAvailability({
        mon: saved.mon || [],
        tue: saved.tue || [],
        wed: saved.wed || [],
        thu: saved.thu || [],
        fri: saved.fri || [],
        sat: saved.sat || [],
        sun: saved.sun || [],
      });

      setSlotMinutes(r.data.slotMinutes || 30);
    })
    .catch((e) =>
      setError(
        e.response?.data?.message || "Could not load doctor profile."
      )
    );
}, []);


function updateAvailabilityWindow(day, index, field, value) {
  setAvailability((prev) => ({
    ...prev,
    [day]: prev[day].map((window, i) =>
      i === index ? { ...window, [field]: value } : window
    ),
  }));
}

function addAvailabilityWindow(day) {
  setAvailability((prev) => ({
    ...prev,
    [day]: [
      ...prev[day],
      { start: "10:00", end: "17:00" },
    ],
  }));
}

function removeAvailabilityWindow(day, index) {
  setAvailability((prev) => ({
    ...prev,
    [day]: prev[day].filter((_, i) => i !== index),
  }));
}

async function saveAvailability() {
  setAvailabilityBusy(true);
  setAvailabilityError("");
  setAvailabilityMessage("");

  try {
    const { data } = await api.put("/doctors/me/availability", {
      availability,
      slotMinutes: Number(slotMinutes),
    });

    setAvailability(data.availability);
    setSlotMinutes(data.slotMinutes);

    setAvailabilityMessage(
      "Weekly availability saved successfully!"
    );
  } catch (e) {
    setAvailabilityError(
      e.response?.data?.message || "Could not save availability."
    );
  } finally {
    setAvailabilityBusy(false);
  }
}


  // Add a leave date
  async function addLeave() {
    if (!leaveDate) {
      setLeaveError("Please select a date.");
      return;
    }

    setLeaveBusy(true);
    setLeaveError("");
    setLeaveMessage("");

    try {
      const { data } = await api.post("/doctors/me/leave", {
        date: leaveDate,
      });

      setLeaveDates(data.leaveDates || []);
      setLeaveDate("");
      setLeaveMessage(data.message);
    } catch (e) {
      setLeaveError(
        e.response?.data?.message || "Could not block this date."
      );
    } finally {
      setLeaveBusy(false);
    }
  }

  // Remove a leave date
  async function removeLeave(date) {
    if (!confirm(`Remove leave for ${date}?`)) return;

    setLeaveBusy(true);
    setLeaveError("");
    setLeaveMessage("");

    try {
      const { data } = await api.delete(`/doctors/me/leave/${date}`);

      setLeaveDates(data.leaveDates || []);
      setLeaveMessage("Leave removed successfully.");
    } catch (e) {
      setLeaveError(
        e.response?.data?.message || "Could not remove leave."
      );
    } finally {
      setLeaveBusy(false);
    }
  }

  // Update appointment status
  async function update(id, status) {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setReload((v) => v + 1);
    } catch (e) {
      setError(e.response?.data?.message || "Could not update status.");
    }
  }

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">DOCTOR SPACE</p>
          <h1>Today's appointments</h1>
          <p className="muted">
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <Notice>{error}</Notice>
      
      
{/* Weekly Availability Management */}
<section className="panel list-panel">
  <h2>Weekly availability</h2>

  <p className="muted">
    Set your working days and appointment timings.
  </p>

  <label className="date-label">
    Appointment duration
    <select
      value={slotMinutes}
      onChange={(e) => setSlotMinutes(Number(e.target.value))}
    >
      <option value={15}>15 minutes</option>
      <option value={30}>30 minutes</option>
    </select>
  </label>

  {weekDays.map((day) => (
    <div key={day.key} style={{ marginBottom: "20px" }}>
      <h3>{day.label}</h3>

      {(availability[day.key] || []).map((window, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: "10px",
            alignItems: "end",
            marginBottom: "10px",
          }}
        >
          <label className="date-label">
            Start time
            <input
              type="time"
              value={window.start}
              onChange={(e) =>
                updateAvailabilityWindow(
                  day.key, index, "start", e.target.value
                )
              }
            />
          </label>

          <label className="date-label">
            End time
            <input
              type="time"
              value={window.end}
              onChange={(e) =>
                updateAvailabilityWindow(
                  day.key, index, "end", e.target.value
                )
              }
            />
          </label>

          <button
            type="button"
            className="text-button danger-text"
            onClick={() => removeAvailabilityWindow(day.key, index)}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn outline"
        onClick={() => addAvailabilityWindow(day.key)}
      >
        + Add working hours
      </button>
    </div>
  ))}

  <Notice>{availabilityError}</Notice>
  <Notice type="success">{availabilityMessage}</Notice>

  <button
    className="btn primary full"
    disabled={availabilityBusy}
    onClick={saveAvailability}
  >
    {availabilityBusy ? "Saving..." : "Save weekly availability"}
  </button>
</section>


      {/* Doctor Leave Management */}
      <section className="panel list-panel">
        <h2>Manage day off</h2>

        <p className="muted">
          Select a date when you will be unavailable. Patients will not be
          able to book appointments on that day.
        </p>

        <label className="date-label">
          Select leave date
          <input
            type="date"
            min={minDate}
            value={leaveDate}
            onChange={(e) => setLeaveDate(e.target.value)}
          />
        </label>

        <button
          className="btn primary"
          disabled={!leaveDate || leaveBusy}
          onClick={addLeave}
        >
          {leaveBusy ? "Please wait..." : "Block this day"}
        </button>

        <Notice>{leaveError}</Notice>
        <Notice type="success">{leaveMessage}</Notice>

        <h3>Blocked dates</h3>

        {leaveDates.length ? (
          [...leaveDates].sort().map((date) => (
            <div className="appointment-row" key={date}>
              <div className="appointment-details">
                <h3>
                  {new Date(`${date}T00:00:00`).toLocaleDateString([], {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </h3>
                <p>Doctor unavailable</p>
              </div>

              <button
                className="text-button danger-text"
                disabled={leaveBusy}
                onClick={() => removeLeave(date)}
              >
                Remove leave
              </button>
            </div>
          ))
        ) : (
          <EmptyState
            title="No days off"
            text="Your blocked dates will appear here."
          />
        )}
      </section>

      {/* Today's appointments */}
      <section className="panel list-panel">
        {appointments.length ? (
          appointments.map((a) => (
            <div className="appointment-row" key={a._id}>
              <div className="time-badge">
                {new Date(a.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <div className="appointment-details">
                <h3>{a.patient?.name || "Patient"}</h3>
                <p>{a.patient?.email || ""}</p>
                <span>{a.reason || "General consultation"}</span>
              </div>

              <div className="appointment-actions">
                <span className={`status ${a.status}`}>{a.status}</span>

                {a.status === "booked" && (
                  <>
                    <button
                      className="text-button"
                      onClick={() => update(a._id, "completed")}
                    >
                      Completed
                    </button>

                    <button
                      className="text-button danger-text"
                      onClick={() => update(a._id, "no-show")}
                    >
                      No-show
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No appointments today"
            text="Today's booked appointments will appear here."
          />
        )}
      </section>
    </main>
  );
}



function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Activity size={18} />
          </span>
          CarePoint
        </Link>
        <p>Thoughtful care, made easier.</p>
        <span>© {new Date().getFullYear()} CarePoint</span>
      </div>
    </footer>
  );
}
export default function App() {
  const [user, setUser] = useState(getStoredUser);
  function onAuth(data) {
    localStorage.setItem("clinic_token", data.token);
    localStorage.setItem("clinic_user", JSON.stringify(data.user));
    setUser(data.user);
  }
  function onLogout() {
    localStorage.removeItem("clinic_token");
    localStorage.removeItem("clinic_user");
    setUser(null);
  }
  return (
    <div className="app">
      <Header user={user} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route
          path="/login"
          element={<AuthPage mode="login" onAuth={onAuth} />}
        />
        <Route
          path="/register"
          element={<AuthPage mode="register" onAuth={onAuth} />}
        />
        <Route
          path="/book/:id"
          element={
            user?.role === "patient" ? (
              <BookPage />
            ) : (
              <AuthPage mode="login" onAuth={onAuth} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user?.role === "patient" ? (
              <Dashboard />
            ) : (
              <AuthPage mode="login" onAuth={onAuth} />
            )
          }
        />
        <Route
          path="/doctor"
          element={
            user?.role === "doctor" ? (
              <DoctorDashboard />
            ) : (
              <AuthPage mode="login" onAuth={onAuth} />
            )
          }
        />
        <Route
          path="*"
          element={
            <main className="container page">
              <h1>Page not found</h1>
              <Link to="/">Return home</Link>
            </main>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}
