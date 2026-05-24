import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { Users, CalendarCheck, Briefcase, LogIn, MapPin, Award } from "lucide-react";
import { employees, fmtMoney } from "@/lib/mock-data";
import { useStoreState } from "@/lib/store";

export const Route = createFileRoute("/employee/")({
  component: EmployeeDashboard,
  head: () => ({ meta: [{ title: "My Dashboard · INT-CRM" }] }),
});

function EmployeeDashboard() {
  const { t } = useI18n();
  const { leads, activities, projects, attendance, profile } = useStoreState();
  const user = { name: profile.name, role: t("employee"), initials: profile.name.split(" ").map(w => w[0]).join("") };

  const myLeads = leads.filter((l) => l.owner === profile.name || !l.owner);
  const myActivities = activities.filter((a) => a.owner === profile.name);
  const myProjects = projects; // Projects list

  const emp = employees.find((e) => e.name === profile.name) || {
    annualTarget: 1000000,
    achievedTarget: 780000,
    leads: 38,
    won: 14,
  };

  // KPI Calculations
  const presentDays = attendance.filter((r) => r.owner === profile.name).length;
  const workingDays = 22; // Standard working days in a month
  const attendanceRate = Math.min(100, (presentDays / workingDays) * 100) || 91;

  const totalActs = myActivities.length;
  const completedActs = myActivities.filter((a) => a.status === "done").length;
  const activityScore = totalActs > 0 ? (completedActs / totalActs) * 100 : 80;

  const achieveRate = emp.annualTarget > 0 ? (emp.achievedTarget / emp.annualTarget) * 100 : 0;
  const targetScore = Math.min(100, achieveRate);

  const overallKpi = Math.round(targetScore * 0.4 + attendanceRate * 0.3 + activityScore * 0.3);

  return (
    <AppShell panel="employee" user={user} pageTitle={`${t("welcome")}, Back 👋`}>
      {/* Check-in card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="absolute inset-y-0 w-1/2 opacity-90" style={{ insetInlineEnd: 0, background: "var(--gradient-brand)" }} />
        <div className="relative grid grid-cols-1 items-center gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("today")} · Riyadh HQ</div>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground">07:52 AM — Checked in</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("workingHours")}: 6h 38m · On time</p>
          </div>
          <div className="relative z-10 flex items-center justify-end gap-3">
            <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-white/95 px-4 text-sm font-semibold text-foreground shadow-md backdrop-blur hover:bg-white">
              <MapPin className="h-4 w-4" /> GPS Verified
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background shadow-md hover:bg-foreground/90">
              <LogIn className="h-4 w-4" /> {t("checkOut")}
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label={t("myLeads")} value={String(myLeads.length)} delta={6.2} icon={Users} accent="primary" />
        <KpiCard label={t("myActivities")} value={String(myActivities.length)} delta={-2.3} icon={CalendarCheck} accent="info" />
        <KpiCard label={t("myProjects")} value={String(myProjects.length)} delta={1.0} icon={Briefcase} accent="success" />
        <KpiCard label="Overall Score" value={`${overallKpi}%`} delta={4.5} icon={Award} accent="warning" />
      </div>

      {/* Target & KPI Monitoring */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
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

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* My leads */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">{t("myLeads")}</h3>
            <button className="text-xs font-semibold text-primary hover:underline">{t("viewAll")}</button>
          </div>
          <div className="mt-4 divide-y divide-border">
            {myLeads.map((l) => (
              <div key={l.id} className="flex items-center gap-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {l.company.split(" ").slice(0, 2).map((w: string) => w[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{l.company}</div>
                  <div className="text-xs text-muted-foreground">{l.contact} · {l.updatedAt}</div>
                </div>
                <span className="hidden font-mono text-sm font-bold text-foreground sm:inline">{fmtMoney(l.value)}</span>
                <StatusBadge status={l.status} label={t(l.status as any)} />
              </div>
            ))}
          </div>
        </div>

        {/* Today's tasks */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <h3 className="font-display text-base font-bold text-foreground">{t("upcomingTasks")}</h3>
          <div className="mt-4 space-y-3">
            {activities.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg bg-secondary/40 p-3">
                <div className="flex h-8 w-10 flex-col items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                  <span>{a.time.split(":")[0]}</span>
                  <span className="opacity-70">{a.time.split(":")[1]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground">{a.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}