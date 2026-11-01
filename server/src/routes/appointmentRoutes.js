const router = require("express").Router();
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const { makeSlots } = require("../utils/slots");

router.use(auth);

router.post("/", roles("patient"), async (req, res, next) => {
  try {
    const { doctorId, start, reason = "" } = req.body;
    if (!mongoose.isValidObjectId(doctorId) || !start)
      return res
        .status(400)
        .json({ message: "Valid doctorId and start are required" });
    if (typeof reason !== "string" || reason.length > 500)
      return res
        .status(400)
        .json({ message: "Reason must be 500 characters or fewer" });
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime()) || startDate <= new Date())
      return res
        .status(400)
        .json({ message: "Choose a future appointment time" });
    const date = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    
    if ((doctor.leaveDates || []).includes(date)) {
  return res.status(400).json({
    message: "Doctor is not available on this date due to leave",
  });
}

    const validSlot = makeSlots(
      date,
      doctor.availability,
      doctor.slotMinutes,
    ).some((s) => s.start.getTime() === startDate.getTime());
    if (!validSlot)
      return res
        .status(400)
        .json({ message: "This time is not an available slot" });
    const endDate = new Date(startDate.getTime() + doctor.slotMinutes * 60000);
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      start: startDate,
      end: endDate,
      reason,
    });
    res
      .status(201)
      .json(await appointment.populate("doctor", "name specialty"));
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({
          message: "This slot was just booked. Please choose another slot.",
        });
    next(err);
  }
});

router.get("/mine", roles("patient"), async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate("doctor", "name specialty")
      .sort({ start: 1 });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

router.get("/today", roles("doctor"), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor)
      return res.status(404).json({ message: "Doctor profile not found" });
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const appointments = await Appointment.find({
      doctor: doctor._id,
      start: { $gte: start, $lte: end },
    })
      .populate("patient", "name email")
      .sort({ start: 1 });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});


router.patch("/:id/reschedule", roles("patient"), async (req, res, next) => {
  try {
    const { start } = req.body;

    if (!mongoose.isValidObjectId(req.params.id) || !start) {
      return res.status(400).json({
        message: "Valid appointment ID and new start time are required",
      });
    }

    // Find only this patient's appointment
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "booked") {
      return res.status(400).json({
        message: "Only booked appointments can be rescheduled",
      });
    }

    // Rescheduling is not allowed within 2 hours of the original appointment
    if (appointment.start.getTime() - Date.now() < 2 * 60 * 60 * 1000) {
      return res.status(400).json({
        message: "Appointments cannot be rescheduled within 2 hours of start time",
      });
    }

    const newStart = new Date(start);

    if (Number.isNaN(newStart.getTime()) || newStart <= new Date()) {
      return res.status(400).json({
        message: "Choose a future appointment time",
      });
    }

    if (newStart.getTime() === appointment.start.getTime()) {
      return res.status(400).json({
        message: "Please choose a different time slot",
      });
    }

    const doctor = await Doctor.findById(appointment.doctor);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const date = `${newStart.getFullYear()}-${String(
      newStart.getMonth() + 1
    ).padStart(2, "0")}-${String(newStart.getDate()).padStart(2, "0")}`;

    // Confirm that the new time belongs to the doctor's schedule
    const validSlot = makeSlots(
      date,
      doctor.availability,
      doctor.slotMinutes
    ).some((slot) => slot.start.getTime() === newStart.getTime());

    if (!validSlot) {
      return res.status(400).json({
        message: "This time is not an available slot",
      });
    }

    appointment.start = newStart;
    appointment.end = new Date(
      newStart.getTime() + doctor.slotMinutes * 60000
    );

    await appointment.save();

    await appointment.populate("doctor", "name specialty");

    res.json(appointment);
  } catch (err) {
    // Database unique index prevents double booking
    if (err.code === 11000) {
      return res.status(409).json({
        message: "This slot was just booked. Please choose another slot.",
      });
    }

    next(err);
  }
});


router.patch("/:id/cancel", roles("patient"), async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== "booked")
      return res
        .status(400)
        .json({ message: "Only booked appointments can be cancelled" });
    if (appointment.start.getTime() - Date.now() < 2 * 60 * 60 * 1000)
      return res
        .status(400)
        .json({
          message:
            "Appointments cannot be cancelled within 2 hours of start time",
        });
    appointment.status = "cancelled";
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", roles("doctor"), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["completed", "no-show"].includes(status))
      return res
        .status(400)
        .json({ message: "Status must be completed or no-show" });
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor)
      return res.status(404).json({ message: "Doctor profile not found" });
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
    });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== "booked")
      return res
        .status(400)
        .json({ message: "Only booked appointments can be updated" });
    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
