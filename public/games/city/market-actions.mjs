// Fictional city work only. This pilot never awards real-world evidence or XP.
export const MARKET_OBJECTS = [
  {
    id: "timber",
    name: "Timber",
    x: 14.5,
    z: 17,
    approach: { x: 15.5, z: 18.3 },
  },
  {
    id: "roofing",
    name: "Roof sheets",
    x: 23.5,
    z: 17,
    approach: { x: 22.5, z: 18.3 },
  },
  {
    id: "stall-a",
    name: "Left stall",
    x: 17.5,
    z: 13.4,
    approach: { x: 17.5, z: 15.5 },
  },
  {
    id: "stall-b",
    name: "Right stall",
    x: 21,
    z: 13.4,
    approach: { x: 21, z: 15.5 },
  },
  {
    id: "cart",
    name: "Abandoned cart",
    x: 19.2,
    z: 18.6,
    approach: { x: 18, z: 18.6 },
  },
  {
    id: "parking",
    name: "Clear parking bay",
    x: 25,
    z: 19,
    approach: { x: 24, z: 19 },
  },
  {
    id: "loading",
    name: "Storage doorway",
    x: 23.5,
    z: 11,
    approach: { x: 22.2, z: 11 },
  },
  {
    id: "produce",
    name: "Produce crate",
    x: 15,
    z: 14,
    approach: { x: 15.5, z: 15.2 },
  },
  {
    id: "shelf",
    name: "Dry store",
    x: 23.5,
    z: 9,
    approach: { x: 22.2, z: 9.5 },
  },
  {
    id: "bell",
    name: "Market bell",
    x: 16,
    z: 20.2,
    approach: { x: 17, z: 20.2 },
  },
];
export function newMarket() {
  return {
    frames: [false, false],
    roofs: [false, false],
    carrying: null,
    cart: "entrance",
    produce: "street",
    opened: false,
    tests: 0,
  };
}
export function marketReport(s) {
  const sheltered = s.roofs.filter(Boolean).length;
  const issues = [];
  if (sheltered < 2) issues.push("Finish both stall frames and roofs.");
  if (s.cart !== "parking")
    issues.push(
      s.cart === "loading"
        ? "The cart blocks the storage doorway. Move it to the clear parking bay."
        : "Move the cart away from the entrance.",
    );
  if (s.produce !== "shelf")
    issues.push("Carry the produce into the dry store.");
  return {
    success: !issues.length,
    issues,
    stalls: sheltered,
    access: s.cart === "parking",
    stockProtected: s.produce === "shelf",
  };
}
export function marketAction(state, id) {
  const s = { ...state, frames: [...state.frames], roofs: [...state.roofs] };
  const reject = (message) => ({ state, message, changed: false });
  let message;
  if (id === "put-down") {
    if (!s.carrying) return reject("Your hands are free.");
    if (s.carrying === "cart")
      return reject("Push the cart to a parking bay before letting go.");
    message = "Returned the item to where you collected it.";
    s.carrying = null;
  } else if (id === "timber" || id === "roofing") {
    if (s.carrying) return reject("Put down what you are carrying first.");
    if ((id === "timber" ? s.frames : s.roofs).every(Boolean))
      return reject("Both stalls already have these parts.");
    s.carrying = id;
    message =
      id === "timber"
        ? "Timber collected. Take it to a damaged stall."
        : "Roof sheets collected. Take them to a repaired frame.";
  } else if (id === "stall-a" || id === "stall-b") {
    const i = id === "stall-a" ? 0 : 1;
    if (!s.frames[i]) {
      if (s.carrying !== "timber")
        return reject(
          "This frame needs timber. Collect a bundle from the timber stack.",
        );
      s.frames[i] = true;
      s.carrying = null;
      message = "Frame repaired! Bring roof sheets to shelter this stall.";
    } else if (!s.roofs[i]) {
      if (s.carrying !== "roofing")
        return reject("The frame is ready. Bring roof sheets.");
      s.roofs[i] = true;
      s.carrying = null;
      message = "Roof fitted! This stall can now shelter a trader.";
    } else return reject("This stall is ready. Help the rest of the market.");
  } else if (id === "cart") {
    if (s.carrying) return reject("Free your hands before pushing the cart.");
    s.carrying = "cart";
    message =
      "You are pushing the cart. Choose a clear bay; keep doorways open.";
  } else if (id === "parking" || id === "loading") {
    if (s.carrying !== "cart")
      return reject("Walk to the abandoned cart to start pushing it.");
    s.cart = id;
    s.carrying = null;
    message =
      id === "parking"
        ? "Entrance cleared! The cart is safely parked."
        : "The entrance is clear, but the cart blocks storage. You can move it again.";
  } else if (id === "produce") {
    if (s.carrying)
      return reject("Free your hands before collecting the crate.");
    if (s.produce === "shelf")
      return reject("The produce is already protected in storage.");
    s.carrying = "produce";
    message = "Crate collected. Carry it into the dry store.";
  } else if (id === "shelf") {
    if (s.carrying !== "produce")
      return reject("Collect the produce crate beside the damaged market.");
    if (s.cart === "loading")
      return reject(
        "The cart is blocking this doorway. Park it in the clear bay first.",
      );
    s.produce = "shelf";
    s.carrying = null;
    message = "Produce stored under shelter. It is protected from the rain.";
  } else if (id === "bell") {
    const report = marketReport(s);
    s.tests++;
    s.opened = report.success;
    message = report.success
      ? "You reopened the market! Traders have shelter, customers can enter, and produce is safe."
      : "Market test: " + report.issues.join(" ");
    return { state: s, message, changed: true, report };
  } else return reject("Choose an object in the market.");
  s.opened = false;
  return { state: s, message, changed: true };
}
export function marketHint(s) {
  if (s.opened) return "Market open! Watch people use what you repaired.";
  if (s.carrying === "timber")
    return "Tap a damaged stall to carry the timber there and repair it.";
  if (s.carrying === "roofing")
    return "Tap a repaired stall to carry over and fit its roof.";
  if (s.carrying === "cart")
    return "Tap the clear parking bay. Keep the storage doorway open.";
  if (s.carrying === "produce")
    return "Tap the dry store to protect this crate.";
  if (s.frames.some((v) => !v))
    return "Tap the timber stack. Your character will walk over and collect a bundle.";
  if (s.roofs.some((v) => !v))
    return "Collect roof sheets, then tap a repaired stall.";
  if (s.cart !== "parking")
    return "Push the abandoned cart to the clear parking bay.";
  if (s.produce !== "shelf")
    return "Carry the produce crate into the dry store.";
  return "Everything is ready. Tap the bell to open the market!";
}
