const router = require("express").Router();
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const { makeSlots } = require("../utils/slots");

router.get("/", async (_req, res, next) => {
  try {
    const doctors = await Doctor.find().select(
      "name specialty bio slotMinutes availability",
    );
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/slots", async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      return res
        .status(400)
        .json({ message: "Provide date in YYYY-MM-DD format" });
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if ((doctor.leaveDates || []).includes(date)) {
      return res.json([]);
    }
    const slots = makeSlots(date, doctor.availability, doctor.slotMinutes);
    const existing = await Appointment.find({
      doctor: doctor._id,
      status: "booked",
      start: {
        $gte: new Date(`${date}T00:00:00`),
        $lt: new Date(`${date}T23:59:59.999`),
      },
    }).select("start");
    const taken = new Set(existing.map((a) => new Date(a.start).getTime()));
    res.json(slots.filter((s) => !taken.has(s.start.getTime())));
  } catch (err) {
    next(err);
  }
});

router.get("/me/profile", auth, roles("doctor"), async (req, res, next) => {
  try {
    const profile = await Doctor.findOne({ user: req.user._id });
    if (!profile)
      return res.status(404).json({ message: "Doctor profile not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});


router.put(
  "/me/availability",
  auth,
  roles("doctor"),
  async (req, res, next) => {
    try {
      const allowed = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

      const { availability, slotMinutes } = req.body;

      if (
        !availability ||
        typeof availability !== "object" ||
        Array.isArray(availability)
      ) {
        return res.status(400).json({
          message: "Availability object is required",
        });
      }

      // Validate slot duration
      if (
        slotMinutes !== undefined &&
        ![15, 30].includes(Number(slotMinutes))
      ) {
        return res.status(400).json({
          message: "Slot duration must be 15 or 30 minutes",
        });
      }

      // Validate weekdays and working hours
      for (const day of Object.keys(availability)) {
        if (!allowed.includes(day) || !Array.isArray(availability[day])) {
          return res.status(400).json({
            message: "Invalid availability day",
          });
        }

        for (const w of availability[day]) {
          if (
            !w.start ||
            !w.end ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(w.start) ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(w.end) ||
            w.start >= w.end
          ) {
            return res.status(400).json({
              message: `Invalid time window for ${day}`,
            });
          }
        }
      }

      const update = { availability };

      if (slotMinutes !== undefined) {
        update.slotMinutes = Number(slotMinutes);
      }

      const profile = await Doctor.findOneAndUpdate(
        { user: req.user._id },
        { $set: update },
        { new: true, runValidators: true }
      );

      if (!profile) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      res.json(profile);
    } catch (err) {
      next(err);
    }
  }
);


// Doctor adds a leave date
router.post("/me/leave", auth, roles("doctor"), async (req, res, next) => {
  try {
    const { date } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Provide date in YYYY-MM-DD format",
      });
    }

    const [year, month, day] = date.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);

    if (
      selectedDate.getFullYear() !== year ||
      selectedDate.getMonth() !== month - 1 ||
      selectedDate.getDate() !== day
    ) {
      return res.status(400).json({
        message: "Invalid calendar date",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Past dates cannot be blocked",
      });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    // Do not block a date with existing booked appointments
    const dayStart = new Date(`${date}T00:00:00`);
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const existing = await Appointment.findOne({
      doctor: doctor._id,
      status: "booked",
      start: { $gte: dayStart, $lt: nextDay },
    });

    if (existing) {
      return res.status(409).json({
        message:
          "This date already has booked appointments. Handle them before blocking this day.",
      });
    }

    if (!(doctor.leaveDates || []).includes(date)) {
      doctor.leaveDates.push(date);
      await doctor.save();
    }

    res.json({
      message: "Leave date added successfully",
      leaveDates: doctor.leaveDates,
    });
  } catch (err) {
    next(err);
  }
});

// Doctor removes a leave date
router.delete(
  "/me/leave/:date",
  auth,
  roles("doctor"),
  async (req, res, next) => {
    try {
      const { date } = req.params;

      const doctor = await Doctor.findOne({ user: req.user._id });

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      doctor.leaveDates = (doctor.leaveDates || []).filter(
        (item) => item !== date,
      );

      await doctor.save();

      res.json({
        message: "Leave date removed successfully",
        leaveDates: doctor.leaveDates,
      });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
