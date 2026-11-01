const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, enum: ["booked", "cancelled", "completed", "no-show"], default: "booked" },
  reason: { type: String, trim: true, maxlength: 500, default: "" }
}, { timestamps: true });
appointmentSchema.index(
  { doctor: 1, start: 1 },
  { unique: true, partialFilterExpression: { status: "booked" } }
);
module.exports = mongoose.model("Appointment", appointmentSchema);
