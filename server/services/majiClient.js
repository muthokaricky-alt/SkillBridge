// server/services/majiClient.js
//
// Upstream integration — SkillBridge is the CONSUMER here, calling Maji
// Website (Team 4's app).
//
// IMPORTANT — this file was rewritten after receiving Maji's real
// openapi.yaml (Week 4 contract handoff, saved at
// src/documentation/MAJI_OPENAPI_RECEIVED.yaml). Their actual contract
// turned out to differ significantly from what was assumed during the
// Week 2/3 needs conversation and endpoint list:
//
//   - /vendors/stations has NO estate query filter, and doesn't return
//     hours or stockLevel — it returns a targetEstateId instead (a
//     foreign key into /estates), which we have to cross-reference
//     ourselves.
//   - /customers/payment-method returns ONE customer's own saved payment
//     method (mpesa/cash/other) — it is not a list of payment options
//     available for a checkout screen. SkillBridge doesn't have a
//     "customer" concept that maps onto this, so this endpoint isn't
//     usable for the original "show payment options at checkout" need.
//   - There is no delivery-tracking capability at all — no
//     GET /deliveries/{id}, no POST /deliveries. Functions for those are
//     kept below as clearly-marked stubs that throw, rather than quietly
//     mock-succeeding, so nothing in the app can accidentally depend on a
//     capability Maji doesn't actually offer.
//   - Maji unexpectedly exposes POST /estates/{estateId}/driver-interests
//     (register interest in doing delivery work) — SkillBridge has no
//     current use for this, but the client function is included for
//     completeness in case a "become a water delivery driver" feature
//     ever makes sense for students.
//
// See src/documentation/CONTRACT_QUESTIONS.md for the specific questions
// raised about these gaps.
//
// As before: until MAJI_API_BASE_URL is set in .env, every function
// returns mock data — but now shaped to match Maji's REAL schema, not our
// earlier guess, so switching to live mode later is a clean swap.

const BASE_URL = process.env.MAJI_API_BASE_URL;
const API_KEY = process.env.MAJI_API_KEY;

let warnedOnce = false;
function warnMockMode() {
  if (!warnedOnce) {
    console.warn(
      "[majiClient] MAJI_API_BASE_URL is not set — returning mock Maji Website data. " +
      "Set MAJI_API_BASE_URL (and MAJI_API_KEY if required) in .env once Team 4 confirms their real API is reachable."
    );
    warnedOnce = true;
  }
}

async function callMaji(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Maji Website request failed (${res.status})`);
    err.status = 502; // bad gateway — the failure is upstream, not ours
    throw err;
  }
  return res.json();
}

// ---- Mock data, shaped exactly like Maji's real contract ----

const MOCK_ESTATES = [
  { id: "est_1029", name: "Kileleshwa, Nairobi", deliveryStatus: "active" },
  { id: "est_1031", name: "Lavington, Nairobi", deliveryStatus: "active" },
  { id: "est_1042", name: "Westlands, Nairobi", deliveryStatus: "active" },
  { id: "est_1058", name: "Kilimani, Nairobi", deliveryStatus: "inactive" },
];

const MOCK_STATIONS = [
  { vendorId: "ven_201", stationName: "Kileleshwa Vendor Point", targetEstateId: "est_1029" },
  { vendorId: "ven_204", stationName: "Lavington Water Hub", targetEstateId: "est_1031" },
  { vendorId: "ven_211", stationName: "Westlands Pickup Station", targetEstateId: "est_1042" },
];

// GET /estates?deliveryStatus={active|inactive}
export async function getEstates(deliveryStatus) {
  if (!BASE_URL) {
    warnMockMode();
    const filtered = deliveryStatus ? MOCK_ESTATES.filter((e) => e.deliveryStatus === deliveryStatus) : MOCK_ESTATES;
    return { source: "mock", estates: filtered };
  }
  const estates = await callMaji(`/estates${deliveryStatus ? `?deliveryStatus=${encodeURIComponent(deliveryStatus)}` : ""}`);
  return { source: "live", estates };
}

// GET /vendors/stations
//
// No estate filter exists on this endpoint in Maji's real contract, so
// "filter by estate" has to happen on OUR side: fetch the estates, find
// the matching id, then filter stations by targetEstateId. This does
// mean an extra round trip compared to what was originally assumed.
export async function getStations(estateName) {
  if (!BASE_URL) {
    warnMockMode();
    let stations = MOCK_STATIONS;
    if (estateName) {
      const match = MOCK_ESTATES.find((e) => e.name.toLowerCase().includes(estateName.toLowerCase()));
      stations = match ? MOCK_STATIONS.filter((s) => s.targetEstateId === match.id) : [];
    }
    return { source: "mock", stations };
  }

  const allStations = await callMaji("/vendors/stations");
  if (!estateName) return { source: "live", stations: allStations };

  const { estates } = await getEstates();
  const match = estates.find((e) => e.name.toLowerCase().includes(estateName.toLowerCase()));
  const stations = match ? allStations.filter((s) => s.targetEstateId === match.id) : [];
  return { source: "live", stations };
}

// GET /customers/payment-method
//
// NOT a fit for the original "show payment options at checkout" need —
// this returns a single customer's own saved method, and SkillBridge has
// no "customer" record to look one up by. Kept only so the shape is
// documented and callable if a real use for it turns up later; nothing
// in the app currently calls this.
export async function getCustomerPaymentMethod(customerId) {
  if (!BASE_URL) {
    warnMockMode();
    return { source: "mock", customerId, paymentMethod: "mpesa" };
  }
  const result = await callMaji(`/customers/payment-method?customerId=${encodeURIComponent(customerId)}`);
  return { source: "live", ...result };
}

// POST /estates/{estateId}/driver-interests
//
// Not currently wired into any SkillBridge UI — included because it's a
// real, working endpoint Maji exposes, in case a future feature (e.g. a
// student signing up to help deliver water for group sessions) wants it.
export async function registerDriverInterest(estateId, { userId, contactMethod } = {}) {
  if (!userId) throw Object.assign(new Error("userId is required"), { status: 400 });
  if (!BASE_URL) {
    warnMockMode();
    return {
      source: "mock",
      id: `mock_di_${Date.now()}`,
      userId,
      estateId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }
  const result = await callMaji(`/estates/${encodeURIComponent(estateId)}/driver-interests`, {
    method: "POST",
    body: JSON.stringify({ userId, contactMethod }),
  });
  return { source: "live", ...result };
}

// ---------------------------------------------------------------------
// The functions below (getDelivery / createDelivery) were part of the
// ORIGINAL assumed contract but have no counterpart in Maji's real API —
// there is no delivery-tracking capability exposed at all. Rather than
// silently returning fake "it worked" mock data forever (which would let
// bugs hide until someone tried this in production), these now throw a
// clear, specific error so any caller finds out immediately that this
// capability doesn't exist upstream, and points at the question raised
// about it.
// ---------------------------------------------------------------------

const NOT_SUPPORTED_MESSAGE =
  "Maji Website's actual API has no delivery-tracking endpoints (no GET /deliveries/{id} or POST /deliveries). " +
  "See Question 1 in src/documentation/CONTRACT_QUESTIONS.md — this is pending clarification from Team 4.";

export async function getDelivery() {
  throw Object.assign(new Error(NOT_SUPPORTED_MESSAGE), { status: 501 });
}

export async function createDelivery() {
  throw Object.assign(new Error(NOT_SUPPORTED_MESSAGE), { status: 501 });
}
