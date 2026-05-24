import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useI18n } from "@/lib/i18n";
import {
  Users,
  Briefcase,
  TrendingUp,
  Target,
  Calendar,
  Phone,
  MapPin,
  Mail,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  kpis,
  pipelineStages,
  activities,
  employees,
  trendSeries,
  fmtMoney,
} from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard · INT-CRM" }] }),
});

const iconMap = { Call: Phone, Meeting: Calendar, Email: Mail, Visit: MapPin } as const;

function AdminDashboard() {
  const { t } = useI18n();
  const user = { name: "hafez Rahim", role: t("admin"), initials: "HR" };
  const maxTrend = Math.max(...trendSeries);

  return (
    <AppShell panel="admin" user={user} pageTitle={t("overview")}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t("totalLeads")} value={kpis.totalLeads.toLocaleString()} delta={kpis.totalLeadsDelta} icon={Users} accent="primary" />
        <KpiCard label={t("activeProjects")} value={String(kpis.activeProjects)} delta={kpis.activeProjectsDelta} icon={Briefcase} accent="info" />
        <KpiCard label={t("revenueForecast")} value={fmtMoney(kpis.revenueForecast)} delta={kpis.revenueForecastDelta} icon={TrendingUp} accent="success" />
        <KpiCard label={t("conversionRate")} value={`${kpis.conversionRate}%`} delta={kpis.conversionRateDelta} icon={Target} accent="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Pipeline */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">{t("pipelineByStage")}</h3>
            <span className="text-xs text-muted-foreground">{t("thisMonth")}</span>
          </div>

          <div className="mt-5 space-y-3">
            {pipelineStages.map((s) => {
              const max = Math.max(...pipelineStages.map((x) => x.value));
              const pct = (s.value / max) * 100;
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="font-semibold text-foreground">{s.label}</span>
                      <span className="text-muted-foreground">· {s.count} {t("leadsCount")}</span>
                    </div>
                    <span className="font-mono font-semibold text-foreground">{fmtMoney(s.value)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trend */}
          <div className="mt-8 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("leadsTrendTitle")}
              </h4>
              <span className="text-xs font-bold text-primary">+24.6%</span>
            </div>
            <div className="mt-4 flex h-32 items-end gap-1.5">
              {trendSeries.map((v, i) => (
                <div
                  key={i}
                  className="group flex-1 rounded-t-md bg-gradient-to-t from-primary/30 to-primary transition-all hover:from-primary hover:to-primary/80"
                  style={{ height: `${(v / maxTrend) * 100}%` }}
                  title={`Week ${i + 1}: ${v}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top performers */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <h3 className="font-display text-base font-bold text-foreground">{t("topPerformers")}</h3>
          <div className="mt-5 space-y-4">
            {employees.slice(0, 5).map((e, idx) => {
              const targetPerc = e.annualTarget ? Math.round(((e.achievedTarget ?? 0) / e.annualTarget) * 100) : e.perf;
              const textColor = targetPerc >= 100 ? "text-emerald-600" : targetPerc >= 75 ? "text-amber-600" : "text-rose-600";
              const bgBadge = targetPerc >= 100 ? "bg-emerald-100 text-emerald-700" : targetPerc >= 75 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
              return (
                <Link
                  key={e.id}
                  to="/admin/employees/$employeeId"
                  params={{ employeeId: e.id }}
                  className="flex items-center gap-3 rounded-lg p-2 -mx-2 transition hover:bg-accent"
                >
                  <div className="relative">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${bgBadge}`}>
                      {e.avatar}
                    </div>
                    {idx === 0 && (
                      <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                        1
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{e.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{e.role}</div>
                  </div>
                  <div className="text-end">
                    <div className={`font-mono text-sm font-bold ${textColor}`}>{targetPerc}%</div>
                    <div className="text-[10px] uppercase text-muted-foreground">{t("score")}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activities & Pipeline mini-board */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">{t("recentActivities")}</h3>
            <Link to="/admin/activities" className="text-xs font-semibold text-primary hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {activities.map((a) => {
              const Icon = iconMap[a.type as keyof typeof iconMap] ?? Calendar;
              return (
                <Link
                  key={a.id}
                  to="/admin/activities/$activityId"
                  params={{ activityId: String(a.id) }}
                  className="flex items-center gap-3 py-3 rounded-lg px-2 -mx-2 transition hover:bg-accent"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.owner} · {a.time}</div>
                  </div>
                  {a.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : a.status === "in_progress" ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{t("live")}</span>
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <h3 className="font-display text-base font-bold text-foreground">{t("quickStatusTitle")}</h3>
          <div className="mt-4 space-y-3 text-sm">
            {[
              { lKey: "newLeadsToday", v: "18", b: "new" },
              { lKey: "awaitingProposal", v: "12", b: "proposal" },
              { lKey: "inNegotiation", v: "7", b: "negotiation" },
              { lKey: "closedWonWeek", v: "5", b: "won" },
              { lKey: "lostWeek", v: "2", b: "lost" },
            ].map((r) => (
              <Link key={r.lKey} to="/admin/leads" className="flex items-center justify-between rounded-lg p-2 -mx-2 transition hover:bg-accent">
                <span className="text-muted-foreground">{t(r.lKey as any)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground">{r.v}</span>
                  <StatusBadge status={r.b} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}