require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Doctor = require("./models/Doctor");

const defaultAvailability = {
  mon: [{ start: "10:00", end: "13:00" }, { start: "17:00", end: "20:00" }],
  tue: [{ start: "10:00", end: "13:00" }, { start: "17:00", end: "20:00" }],
  wed: [{ start: "10:00", end: "13:00" }, { start: "17:00", end: "20:00" }],
  thu: [{ start: "10:00", end: "13:00" }, { start: "17:00", end: "20:00" }],
  fri: [{ start: "10:00", end: "13:00" }, { start: "17:00", end: "20:00" }],
  sat: [{ start: "10:00", end: "13:00" }],
  sun: []
};

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI in server/.env first");
  await mongoose.connect(process.env.MONGO_URI);
  const list = [
    { name: "Dr. Aisha Khan", email: "aisha.doctor@example.com", specialty: "Cardiology", bio: "Heart health and preventive care." },
    { name: "Dr. Rahul Sharma", email: "rahul.doctor@example.com", specialty: "Dermatology", bio: "Skin, hair and nail care." },
    { name: "Dr. Neha Verma", email: "neha.doctor@example.com", specialty: "General Medicine", bio: "Primary care and general consultation." }
  ];
  for (const item of list) {
    let user = await User.findOne({ email: item.email });
    if (!user) user = await User.create({ name: item.name, email: item.email, password: await bcrypt.hash("DoctorDemo123!", 10), role: "doctor" });
    await Doctor.findOneAndUpdate(
      { user: user._id },
      { user: user._id, name: item.name, specialty: item.specialty, bio: item.bio, slotMinutes: 30, availability: defaultAvailability },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log("Seed complete. Demo doctor password: DoctorDemo123!");
  console.log("Doctor emails: aisha.doctor@example.com, rahul.doctor@example.com, neha.doctor@example.com");
  await mongoose.disconnect();
}
seed().catch(async err => { console.error(err); await mongoose.disconnect(); process.exit(1); });
