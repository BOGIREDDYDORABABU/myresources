import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function AccountSettings() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const [resendMsg, setResendMsg] = useState("");
  const [resendBusy, setResendBusy] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    setProfileBusy(true);
    try {
      const res = await api.put("/users/me", profile);
      const updated = res.data.data;
      updateUser(updated);
      setProfileMsg("Profile updated.");
      if (updated.email !== user.email) {
        setProfileMsg("Profile updated. Check your new email inbox to verify it.");
      }
    } catch (err) {
      setProfileErr(err.response?.data?.message || "Could not update your profile.");
    } finally {
      setProfileBusy(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    setPwBusy(true);
    try {
      await api.post("/users/me/password", pw);
      setPwMsg("Password changed successfully.");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwErr(err.response?.data?.message || "Could not change your password.");
    } finally {
      setPwBusy(false);
    }
  }

  async function handleResend() {
    setResendMsg("");
    setResendBusy(true);
    try {
      await api.post("/users/me/resend-verification");
      setResendMsg("Verification email sent — check your inbox.");
    } catch (err) {
      setResendMsg(err.response?.data?.message || "Could not resend verification email.");
    } finally {
      setResendBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Account Settings</h1>

      {user.email && (
        <div className={`mb-6 flex items-center gap-2 rounded-2xl border p-4 text-sm ${
          user.emailVerified ? "border-forest-200 bg-forest-50 text-forest-700" : "border-ochre-400 bg-ochre-100/60 text-ochre-600"
        }`}>
          {user.emailVerified ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
          <span className="flex-1">
            {user.emailVerified ? "Your email is verified." : "Your email isn't verified yet."}
          </span>
          {!user.emailVerified && (
            <button onClick={handleResend} disabled={resendBusy} className="rounded-full border border-ochre-600 px-3 py-1 text-xs font-semibold hover:bg-white">
              {resendBusy ? "Sending…" : "Resend link"}
            </button>
          )}
        </div>
      )}
      {resendMsg && <p className="mb-4 text-xs text-ink-soft">{resendMsg}</p>}

      <form onSubmit={handleProfileSubmit} className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-white/60 p-6">
        <p className="font-display font-semibold text-ink">Profile</p>
        {profileErr && <div className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{profileErr}</div>}
        {profileMsg && <div className="rounded-lg bg-forest-50 px-3 py-2 text-sm text-forest-700">{profileMsg}</div>}

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Name
          <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Email
            <input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Phone
            <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Location
          <input value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
        </label>
        <button disabled={profileBusy} className="mt-2 self-start rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-paper hover:bg-forest-600 disabled:opacity-60">
          {profileBusy ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-white/60 p-6">
        <p className="font-display font-semibold text-ink">Change password</p>
        {pwErr && <div className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{pwErr}</div>}
        {pwMsg && <div className="rounded-lg bg-forest-50 px-3 py-2 text-sm text-forest-700">{pwMsg}</div>}

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Current password
          <input required type="password" value={pw.currentPassword}
            onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          New password
          <input required type="password" minLength={6} value={pw.newPassword}
            onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
        </label>
        <button disabled={pwBusy} className="mt-2 self-start rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-paper hover:bg-forest-600 disabled:opacity-60">
          {pwBusy ? "Changing…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
