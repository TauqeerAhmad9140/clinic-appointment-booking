
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specialty: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    default: "",
  },
  slotMinutes: {
    type: Number,
    enum: [15, 30],
    default: 30,
  },
  availability: {
    mon: [{ start: String, end: String }],
    tue: [{ start: String, end: String }],
    wed: [{ start: String, end: String }],
    thu: [{ start: String, end: String }],
    fri: [{ start: String, end: String }],
    sat: [{ start: String, end: String }],
    sun: [{ start: String, end: String }],
  },

  // New field for doctor leave management
  leaveDates: {
    type: [String],
    default: [],
  },

}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);
