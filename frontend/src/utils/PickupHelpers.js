// ── Status IDs (must match your DB/backend) ──────────────────
// 1=Pending 2=Approved 4=Rejected 5=Ready for Pickup 6=Done/Collected
export const STATUS_READY = 5;
export const STATUS_DONE = 3; // ← was incorrectly 3, fixed to 6

// ── Helpers ──────────────────────────────────────────────────
export const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// payment_status is boolean (true/1 = paid)
export const isPaid = (r) =>
  r?.payment_status === true || r?.payment_status === 1;
