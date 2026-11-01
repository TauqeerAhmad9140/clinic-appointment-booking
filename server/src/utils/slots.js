function dayKey(date) {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getDay()];
}
function makeSlots(dateString, availability, durationMinutes = 30) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];
  const windows = availability?.[dayKey(date)] || [];
  const now = new Date();
  const slots = [];
  for (const window of windows) {
    const [sh, sm] = window.start.split(":").map(Number);
    const [eh, em] = window.end.split(":").map(Number);
    let cursor = new Date(date);
    cursor.setHours(sh, sm, 0, 0);
    const end = new Date(date);
    end.setHours(eh, em, 0, 0);
    while (cursor.getTime() + durationMinutes * 60000 <= end.getTime()) {
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000);
      if (cursor > now) slots.push({ start: new Date(cursor), end: slotEnd });
      cursor = new Date(cursor.getTime() + durationMinutes * 60000);
    }
  }
  return slots;
}
module.exports = { makeSlots, dayKey };
