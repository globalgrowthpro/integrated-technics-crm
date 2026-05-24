import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { employees, leads as mockLeads, fmtMoney } from "@/lib/mock-data";
import { useStoreState } from "@/lib/store";
import { ArrowLeft, History as HistoryIcon, Activity as ActivityIcon, Clock4, Timer, CalendarDays, Users2, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/employees/$employeeId")({
  component: EmployeeDetailsPage,
  head: ({ params }) => ({ meta: [{ title: `${params.employeeId} · INT-CRM` }] }),
});

function fmtTime(iso: string) {
  const d = new Date(iso);
  // Stable, locale-independent format to avoid SSR/client hydration mismatch
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EmployeeDetailsPage() {
  const { employeeId } = Route.useParams();
  const { t } = useI18n();
  const router = useRouter();
  const { activities, history } = useStoreState();
  const emp = employees.find((e) => e.id === employeeId);
  const user = { name: "hafez Rahim", role: t("admin"), initials: "HR" };
  const [tab, setTab] = useState<"overview" | "attendance" | "leads">("overview");
  const [monthOffset, setMonthOffset] = useState(0);

  if (!emp) {
    return (
      <AppShell panel="admin" user={user} pageTitle="Employee">
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Employee <span className="font-mono">{employeeId}</span> not found.</p>
          <Link to="/admin/employees" className="mt-3 inline-block text-sm font-semibold text-primary">Back to employees</Link>
        </div>
      </AppShell>
    );
  }

  const empActivities = activities.filter((a) => a.owner === emp.name);
  const empHistory = history.filter((h) => h.actor === emp.name || h.target === emp.name);

  // Related leads: leads owned by this employee
  const empLeads = mockLeads.filter((l) => l.owner === emp.name);

  // Synthesized monthly attendance — deterministic per employee + day
  const monthlyAttendance = useMemo(() => {
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + monthOffset);
    const year = base.getFullYear();
    const month = base.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const seed = emp.id.charCodeAt(0) + emp.id.charCodeAt(emp.id.length - 1);
    const todayIso = new Date().toISOString().slice(0, 10);

    type Row = { date: string; weekday: string; status: "present" | "late" | "absent" | "off" | "upcoming"; in: string; out: string; hours: string };
    const rows: Row[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month, d);
      const iso = day.toISOString().slice(0, 10);
      const dow = day.getDay(); // 0 Sun .. 6 Sat
      const weekday = day.toLocaleDateString(undefined, { weekday: "short" });
      const isWeekend = dow === 5 || dow === 6;
      const future = iso > todayIso;
      let status: Row["status"] = "present";
      let inT = "—", outT = "—", hours = "—";
      if (isWeekend) status = "off";
      else if (future) status = "upcoming";
      else {
        const r = (seed * 9301 + d * 49297) % 100;
        if (r < 8) status = "absent";
        else if (r < 22) status = "late";
        else status = "present";
        if (status !== "absent") {
          const inMin = status === "late" ? 8 * 60 + 20 + (r % 25) : 7 * 60 + 45 + (r % 18);
          const outMin = 17 * 60 + (r % 30);
          const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
          inT = fmt(inMin); outT = fmt(outMin);
          const tot = outMin - inMin;
          hours = `${Math.floor(tot / 60)}h ${tot % 60}m`;
        }
      }
      rows.push({ date: iso, weekday, status, in: inT, out: outT, hours });
    }
    const summary = {
      present: rows.filter((r) => r.status === "present").length,
      late: rows.filter((r) => r.status === "late").length,
      absent: rows.filter((r) => r.status === "absent").length,
      working: rows.filter((r) => r.status !== "off" && r.status !== "upcoming").length,
      label: base.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    };
    return { rows, summary };
  }, [emp.id, monthOffset]);

  // Daily working hours (last 7 days)
  const days: { date: string; label: string; mins: number; done: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dayActs = empActivities.filter((a) => a.dueDate === iso);
    const mins = dayActs.reduce((s, a) => s + (a.estMinutes ?? 0), 0);
    const done = dayActs.filter((a) => a.status === "done").reduce((s, a) => s + (a.estMinutes ?? 0), 0);
    days.push({ date: iso, label: d.toLocaleDateString(undefined, { weekday: "short" }), mins, done, count: dayActs.length });
  }
  const maxMins = Math.max(60, ...days.map((d) => d.mins));
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayMins = days.find((d) => d.date === todayIso)?.mins ?? 0;
  const weekMins = days.reduce((s, d) => s + d.mins, 0);
  const fmtH = (mins: number) => {
    const h = Math.floor(mins / 60); const m = mins % 60;
    return mins ? (h ? `${h}h ${m ? `${m}m` : ""}`.trim() : `${m}m`) : "0";
  };

  // KPI Calculations
  const presentDays = monthlyAttendance.summary.present;
  const lateDays = monthlyAttendance.summary.late;
  const workingDays = monthlyAttendance.summary.working;
  const attendanceRate = workingDays > 0
    ? Math.min(100, ((presentDays + lateDays * 0.5) / workingDays) * 100)
    : 91;

  const totalActs = empActivities.length;
  const completedActs = empActivities.filter((a) => a.status === "done").length;
  const activityScore = totalActs > 0 ? (completedActs / totalActs) * 100 : 80;

  const achieveRate = emp.annualTarget > 0 ? (emp.achievedTarget / emp.annualTarget) * 100 : 0;
  const targetScore = Math.min(100, achieveRate);

  const overallKpi = Math.round(targetScore * 0.4 + attendanceRate * 0.3 + activityScore * 0.3);

  return (
    <AppShell panel="admin" user={user} pageTitle={emp.name}>
      <button onClick={() => router.history.back()} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to employees
      </button>

      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-2xl font-bold text-primary-foreground shadow-[var(--shadow-brand)]">
            {emp.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-extrabold text-foreground">{emp.name}</h2>
            <div className="mt-1 text-sm text-muted-foreground">{emp.role} · {emp.department}</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{emp.id}</div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <Stat label="Leads" value={empLeads.length} />
            <Stat label="Won" value={emp.won} />
            <Stat label={t("performance")} value={`${overallKpi}%`} tone={overallKpi >= 100 ? "text-emerald-600" : overallKpi >= 75 ? "text-amber-600" : "text-rose-600"} />
          </div>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className={`h-full rounded-full ${overallKpi >= 100 ? "bg-emerald-500" : overallKpi >= 75 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${overallKpi}%` }} />
        </div>
      </div>

      <div className="mb-5 inline-flex rounded-lg border border-border bg-card p-1 shadow-[var(--shadow-soft)]">
        {([
          { k: "overview", label: "Overview", Icon: ActivityIcon },
          { k: "attendance", label: "Attendance", Icon: CalendarDays },
          { k: "leads", label: `Related Leads (${empLeads.length})`, Icon: Users2 },
        ] as const).map(({ k, label, Icon }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${tab === k ? "bg-primary text-primary-foreground shadow-[var(--shadow-brand)]" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "attendance" && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setMonthOffset((m) => m - 1)} className="rounded-lg border border-border p-1.5 hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
              <div className="font-display text-base font-bold text-foreground min-w-[140px] text-center">{monthlyAttendance.summary.label}</div>
              <button onClick={() => setMonthOffset((m) => m + 1)} className="rounded-lg border border-border p-1.5 hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
              {monthOffset !== 0 && (
                <button onClick={() => setMonthOffset(0)} className="ml-2 text-xs font-semibold text-primary hover:underline">This month</button>
              )}
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-600"><b>{monthlyAttendance.summary.present}</b> present</span>
              <span className="text-amber-600"><b>{monthlyAttendance.summary.late}</b> late</span>
              <span className="text-rose-600"><b>{monthlyAttendance.summary.absent}</b> absent</span>
              <span className="text-muted-foreground">/ {monthlyAttendance.summary.working} working days</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Day</th>
                  <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Check In</th>
                  <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Check Out</th>
                  <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hours</th>
                  <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthlyAttendance.rows.map((r) => (
                  <tr key={r.date} className="hover:bg-primary/5">
                    <td className="px-3 py-2 font-mono text-xs text-foreground">{r.date}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.weekday}</td>
                    <td className="px-3 py-2 font-mono text-foreground">{r.in}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{r.out}</td>
                    <td className="px-3 py-2 font-mono text-foreground">{r.hours}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${r.status === "present" ? "bg-emerald-50 text-emerald-700" :
                        r.status === "late" ? "bg-amber-50 text-amber-700" :
                          r.status === "absent" ? "bg-rose-50 text-rose-700" :
                            r.status === "off" ? "bg-secondary text-muted-foreground" :
                              "bg-secondary/50 text-muted-foreground"
                        }`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "leads" && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-2">
            <Users2 className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Related Leads</h3>
          </div>
          {empLeads.length === 0 && <p className="text-sm text-muted-foreground">No leads assigned to this employee.</p>}
          <div className="divide-y divide-border">
            {empLeads.map((l) => (
              <Link key={l.id} to="/admin/leads/$leadId" params={{ leadId: l.id }} className="flex items-center gap-3 py-3 hover:bg-primary/5">
                <span className="font-mono text-xs text-muted-foreground w-20">{l.id}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground">{l.company}</div>
                  <div className="text-xs text-muted-foreground">{l.contact} · {l.industry} · {l.city}</div>
                </div>
                <StatusBadge status={l.status} label={t(l.status as any)} />
                <span className="ml-3 font-mono text-sm font-bold text-foreground">{fmtMoney(l.value)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Target & KPI Monitoring */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-display text-base font-bold text-foreground mb-4">🎯 Target & KPI Monitoring</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Target Card */}
              <div className="rounded-lg bg-secondary/30 p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sales Targets</div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Yearly Target:</span>
                    <span className="font-bold text-foreground">{fmtMoney(emp.annualTarget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Target:</span>
                    <span className="font-bold text-foreground">{fmtMoney(Math.round(emp.annualTarget / 12))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Yearly Achieved:</span>
                    <span className="font-bold text-foreground">{fmtMoney(emp.achievedTarget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Achieved:</span>
                    <span className="font-bold text-foreground">{fmtMoney(Math.round(emp.achievedTarget / 12))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Achievement Rate:</span>
                    <span className={`font-bold ${
                      achieveRate >= 100 ? "text-emerald-600" : achieveRate >= 75 ? "text-amber-600" : "text-rose-600"
                    }`}>{achieveRate.toFixed(1)}%</span>
                  </div>
                </div>
                {/* Achievement Bar */}
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full ${
                        achieveRate >= 100 ? "bg-emerald-500" : achieveRate >= 75 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, achieveRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* KPI Weightage & Breakdown */}
              <div className="rounded-lg bg-secondary/30 p-4 col-span-1 md:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overall Performance Index</div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Overall KPI Gauge */}
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4" style={{ borderColor: overallKpi >= 100 ? '#10b981' : overallKpi >= 75 ? '#f59e0b' : '#ef4444' }}>
                    <div className="text-center">
                      <div className="font-mono text-2xl font-bold text-foreground">{overallKpi}%</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Score</div>
                    </div>
                  </div>
                  {/* Score Breakdown List */}
                  <div className="flex-1 w-full space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-muted-foreground">Target Achievement KPI (Weight: 40%)</span>
                        <span className="text-foreground">{Math.min(100, achieveRate).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, achieveRate)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-muted-foreground">Attendance Rate (Weight: 30%)</span>
                        <span className="text-foreground">{attendanceRate.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div className="h-full bg-emerald-500" style={{ width: `${attendanceRate}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-muted-foreground">Activity Performance (Weight: 30%)</span>
                        <span className="text-foreground">{activityScore.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div className="h-full bg-sky-500" style={{ width: `${activityScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock4 className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Daily Working Hours</h3>
              </div>
              <div className="flex gap-5 text-end">
                <div>
                  <div className="font-mono text-lg font-bold text-foreground">{fmtH(todayMins)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-primary">{fmtH(weekMins)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last 7 days</div>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-2 sm:gap-3">
              {days.map((d) => {
                const h = Math.max(6, Math.round((d.mins / maxMins) * 120));
                const doneH = Math.round((d.done / maxMins) * 120);
                return (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="text-[10px] font-semibold text-muted-foreground">{fmtH(d.mins)}</div>
                    <div className="relative w-full max-w-[40px] overflow-hidden rounded-md bg-secondary" style={{ height: 120 }}>
                      <div className="absolute bottom-0 w-full bg-primary/30" style={{ height: `${h}px` }} />
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-orange-500" style={{ height: `${doneH}px` }} />
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${d.date === todayIso ? "text-primary" : "text-muted-foreground"}`}>{d.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Done</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary/30" /> Planned</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Assigned Activities</h3>
            </div>
            {empActivities.length === 0 && <p className="text-sm text-muted-foreground">No activities owned.</p>}
            <div className="space-y-2">
              {empActivities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{a.type}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.dueDate} {a.time}{a.estMinutes ? ` · ${fmtH(a.estMinutes)}` : ""}</div>
                  </div>
                  {a.estMinutes != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/20"><Timer className="h-3 w-3" /> {fmtH(a.estMinutes)}</span>
                  )}
                  <span className="text-xs font-semibold capitalize text-muted-foreground">{a.status.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex items-center gap-2">
              <HistoryIcon className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Audit Trail</h3>
            </div>
            <ol className="relative ms-3 border-s border-border ps-5">
              {empHistory.length === 0 && <li className="text-sm text-muted-foreground">No history yet.</li>}
              {empHistory.map((h) => (
                <li key={h.id} className="relative pb-5 last:pb-0">
                  <span className="absolute -start-[27px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="text-xs text-muted-foreground">{fmtTime(h.ts)}</div>
                  <div className="text-sm font-semibold text-foreground">{h.action} — <span className="text-muted-foreground font-normal">{h.target}</span></div>
                  {h.details && <div className="text-xs text-muted-foreground">{h.details}</div>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value, tone = "text-foreground" }: { label: string; value: any; tone?: string }) {
  return (
    <div>
      <div className={`font-mono text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}