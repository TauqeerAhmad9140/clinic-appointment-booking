
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("./utils/connectDB");
const User = require("./models/User");
const Doctor = require("./models/Doctor");

const demoPassword = "Doctor@123";

const availability = {
  mon: [
    { start: "10:00", end: "13:00" },
    { start: "17:00", end: "20:00" },
  ],
  tue: [
    { start: "10:00", end: "13:00" },
    { start: "17:00", end: "20:00" },
  ],
  wed: [
    { start: "10:00", end: "13:00" },
    { start: "17:00", end: "20:00" },
  ],
  thu: [
    { start: "10:00", end: "13:00" },
    { start: "17:00", end: "20:00" },
  ],
  fri: [
    { start: "10:00", end: "13:00" },
    { start: "17:00", end: "20:00" },
  ],
  sat: [
    { start: "10:00", end: "13:00" },
    { start: "17:00", end: "20:00" },
  ],
  sun: [],
};

const doctors = [
  {
    name: "Dr. Ayesha Khan",
    email: "dr.ayesha@example.com",
    specialty: "Cardiologist",
    bio: "Specialist in heart health and cardiovascular care.",
  },
  {
    name: "Dr. Rahul Verma",
    email: "dr.rahul@example.com",
    specialty: "Dermatologist",
    bio: "Specialist in skin and hair care.",
  },
  {
    name: "Dr. Neha Sharma",
    email: "dr.neha@example.com",
    specialty: "General Physician",
    bio: "Provides general health consultations.",
  },
];

async function seedDoctors() {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash(demoPassword, 10);

    for (const doctorData of doctors) {
      let user = await User.findOne({
        email: doctorData.email,
      });

      if (!user) {
        user = new User({
          name: doctorData.name,
          email: doctorData.email,
          password: hashedPassword,
          role: "doctor",
        });
      } else {
        user.name = doctorData.name;
        user.password = hashedPassword;
        user.role = "doctor";
      }

      await user.save();

      await Doctor.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            name: doctorData.name,
            specialty: doctorData.specialty,
            bio: doctorData.bio,
            slotMinutes: 30,
            availability,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

      console.log(`Doctor added/updated: ${doctorData.name}`);
    }

    console.log("All 3 doctors are ready!");
  } finally {
    await mongoose.disconnect();
  }
}

seedDoctors().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
});
