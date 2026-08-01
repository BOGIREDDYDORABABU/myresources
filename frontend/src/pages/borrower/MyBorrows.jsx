import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusPill from "../../components/StatusPill";

export default function MyBorrows() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({});
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    api.get("/borrow/requests/mine", { params: { size: 50 } })
      .then((res) => setRequests(res.data.data.content))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function verifyOtp(id) {
    setBusyId(id);
    try {
      await api.post(`/borrow/requests/${id}/verify-otp`, { otpCode: otpInputs[id] || "" });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setBusyId(null);
    }
  }

  async function requestReturn(id) {
    setBusyId(id);
    try {
      await api.post(`/borrow/requests/${id}/request-return`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not request return.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">My Borrows</h1>
      {loading ? (
        <div className="py-16 text-center text-ink-soft">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-ink-soft">
          You haven&rsquo;t borrowed anything yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-white/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display font-semibold text-ink">{r.resource.name}</p>
                  <p className="text-xs text-ink-soft">{r.startDate} → {r.expectedReturnDate} • Qty {r.quantity}</p>
                  {r.totalBorrowFee != null && <p className="text-xs text-ink-soft">Fee: ₹{r.totalBorrowFee}</p>}
                </div>
                <StatusPill status={r.status} />
              </div>

              {r.status === "APPROVED" && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    placeholder="Enter OTP"
                    value={otpInputs[r.id] || ""}
                    onChange={(e) => setOtpInputs((s) => ({ ...s, [r.id]: e.target.value }))}
                    className="w-32 rounded-lg border border-border bg-paper px-3 py-1.5 text-sm"
                  />
                  <button disabled={busyId === r.id} onClick={() => verifyOtp(r.id)}
                    className="rounded-full bg-forest-700 px-3 py-1.5 text-xs font-semibold text-paper hover:bg-forest-600">
                    Verify OTP
                  </button>
                </div>
              )}
              {r.status === "OTP_VERIFIED" && (
                <p className="mt-3 text-xs text-sky">Show this pickup code to the owner: <span className="font-mono">{r.pickupQrCode}</span></p>
              )}
              {r.status === "ACTIVE" && (
                <button disabled={busyId === r.id} onClick={() => requestReturn(r.id)}
                  className="mt-3 rounded-full border border-forest-600 px-3 py-1.5 text-xs font-semibold text-forest-700 hover:bg-forest-50">
                  Request return
                </button>
              )}
              {r.status === "REJECTED" && r.rejectionReason && (
                <p className="mt-3 text-xs text-clay">Reason: {r.rejectionReason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
