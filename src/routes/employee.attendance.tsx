import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { actions, useStoreState, type AttendanceRecord } from "@/lib/store";
import { useMemo, useState } from "react";
import { LogIn, LogOut, MapPin, Clock, Plus, Pencil, Trash2, Check, X } from "lucide-react";

export const Route = createFileRoute("/employee/attendance")({
  component: AttendancePage,
});

function computeHours(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return "—";
  const [ih, im] = checkIn.split(":").map(Number);
  const [oh, om] = checkOut.split(":").map(Number);
  const mins = oh * 60 + om - (ih * 60 + im);
  if (mins <= 0) return "—";
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

function AttendancePage() {
  const { t } = useI18n();
  const { attendance, profile } = useStoreState();
  const today = new Date().toISOString().slice(0, 10);
  const mine = useMemo(
    () => attendance.filter((a) => a.owner === profile.name).sort((a, b) => b.date.localeCompare(a.date)),
    [attendance, profile.name],
  );
  const todayRec = mine.find((a) => a.date === today);
  const [editing, setEditing] = useState<AttendanceRecord | "new" | null>(null);

  const handleCheckIn = () => {
    const now = new Date().toTimeString().slice(0, 5);
    actions.addAttendance({ date: today, checkIn: now, checkOut: "", hours: "—", location: profile.location, owner: profile.name });
  };
  const handleCheckOut = () => {
    if (!todayRec) return;
    const now = new Date().toTimeString().slice(0, 5);
    actions.updateAttendance(todayRec.id, { checkOut: now, hours: computeHours(todayRec.checkIn, now) });
  };

  return (
    <AppShell panel="employee" user={{ name: profile.name, role: t("employee"), initials: profile.name.split(" ").map((s) => s[0]).join("").slice(0, 2) }} pageTitle={t("attendance")}>
      <div className="rounded-2xl border border-border p-6 shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-brand)" }}>
        <div className="flex flex-col items-center gap-4 text-center text-white">
          <Clock className="h-10 w-10" />
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70">{t("today")} · {profile.location}</div>
            <div className="font-display text-4xl font-bold">{todayRec ? todayRec.checkIn : "—:—"}</div>
            <div className="mt-1 text-sm text-white/80">{t("workingHours")}: {todayRec ? (todayRec.hours !== "—" ? todayRec.hours : computeHours(todayRec.checkIn, new Date().toTimeString().slice(0, 5))) : "—"}</div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-xs font-semibold text-white"><MapPin className="h-4 w-4" /> GPS Verified</span>
            {!todayRec ? (
              <button onClick={handleCheckIn} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-white/90"><LogIn className="h-4 w-4" /> {t("checkIn")}</button>
            ) : !todayRec.checkOut ? (
              <button onClick={handleCheckOut} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/90"><LogOut className="h-4 w-4" /> {t("checkOut")}</button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"><Check className="h-4 w-4" /> Done for today</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display text-base font-bold text-foreground">My logs</h3>
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Add log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("checkIn")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("checkOut")}</th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("workingHours")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mine.map((w) => (
                <tr key={w.id}>
                  <td className="px-4 py-3 font-semibold text-foreground">{w.date}</td>
                  <td className="px-4 py-3 font-mono">{w.checkIn || "—"}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{w.checkOut || "—"}</td>
                  <td className="px-4 py-3 text-end font-mono font-bold text-foreground">{w.hours}</td>
                  <td className="px-4 py-3 text-end">
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(w)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { if (confirm(`Delete log for ${w.date}?`)) actions.removeAttendance(w.id); }} className="rounded p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {mine.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No attendance logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <AttendanceFormModal initial={editing === "new" ? null : editing} owner={profile.name} location={profile.location} onClose={() => setEditing(null)} />}
    </AppShell>
  );
}

function AttendanceFormModal({ initial, owner, location, onClose }: { initial: AttendanceRecord | null; owner: string; location: string; onClose: () => void }) {
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? "");
  const [loc, setLoc] = useState(initial?.location ?? location);
  const submit = () => {
    const hours = computeHours(checkIn, checkOut);
    if (initial) actions.updateAttendance(initial.id, { date, checkIn, checkOut, hours, location: loc });
    else actions.addAttendance({ date, checkIn, checkOut, hours, location: loc, owner });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{initial ? "Edit log" : "Add log"}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></label>
          <label className="block"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Check in</span><input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></label>
          <label className="block"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Check out</span><input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></label>
          <label className="col-span-2 block"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Location</span><input value={loc} onChange={(e) => setLoc(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">Cancel</button>
          <button onClick={submit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{initial ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}