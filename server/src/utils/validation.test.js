const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSlots } = require("./slots");

test("makeSlots returns no slots for a day without availability", () => {
  assert.deepEqual(makeSlots("2035-01-07", { sun: [] }, 30), []);
});
test("makeSlots creates 30-minute slots in a window", () => {
  const slots = makeSlots("2035-01-01", { mon: [{ start: "10:00", end: "11:00" }] }, 30);
  assert.equal(slots.length, 2);
  assert.equal((slots[1].start - slots[0].start) / 60000, 30);
});
test("makeSlots does not create a slot beyond the window", () => {
  const slots = makeSlots("2035-01-01", { mon: [{ start: "10:00", end: "10:40" }] }, 30);
  assert.equal(slots.length, 1);
});
