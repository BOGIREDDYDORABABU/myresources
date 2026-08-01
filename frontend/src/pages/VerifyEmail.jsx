import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { MailCheck, XCircle } from "lucide-react";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    api
      .post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "This verification link is invalid or has expired.");
      });
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      {status === "verifying" && <p className="text-sm text-ink-soft">Verifying your email…</p>}

      {status === "success" && (
        <>
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-paper">
            <MailCheck size={22} />
          </span>
          <h1 className="font-display text-2xl font-semibold text-forest-900">Email verified</h1>
          <p className="mt-2 text-sm text-ink-soft">Your email address is now confirmed.</p>
          <Link to="/" className="mt-6 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600">
            Continue to My Resources
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-clay text-paper">
            <XCircle size={22} />
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">Verification failed</h1>
          <p className="mt-2 text-sm text-ink-soft">{message}</p>
          <Link to="/me" className="mt-6 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600">
            Go to my account
          </Link>
        </>
      )}
    </div>
  );
}
