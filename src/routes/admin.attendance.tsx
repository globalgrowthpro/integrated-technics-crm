import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { attendanceToday, employees } from "@/lib/mock-data";
import { CheckCircle2, AlertTriangle, XCircle, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin/attendance")({
  component: AttendancePage,
  head: () => ({ meta: [{ title: "Attendance · INT-CRM" }] }),
});

function AttendancePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const user = { name: "hafez Rahim", role: t("admin"), initials: "HR" };

  const stats = [
    { label: t("presentToday"), v: attendanceToday.present, total: attendanceToday.total, Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: t("late"), v: attendanceToday.late, total: attendanceToday.total, Icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: t("absent"), v: attendanceToday.absent, total: attendanceToday.total, Icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <AppShell panel="admin" user={user} pageTitle={t("attendance")}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                <s.Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-foreground">{s.v}</span>
              <span className="text-sm text-muted-foreground">/ {s.total}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-base font-bold text-foreground">{t("todaysRecordsTitle")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("name")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("checkIn")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("checkOut")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("locationGPS")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendanceToday.records.map((r) => {
                const emp = employees.find((e) => e.name === r.name);
                return (
                  <tr
                    key={r.id}
                    onClick={() => emp && navigate({ to: "/admin/employees/$employeeId", params: { employeeId: emp.id } })}
                    className={`${emp ? "cursor-pointer" : ""} hover:bg-primary/5`}
                  >
                    <td className="px-4 py-3 font-semibold text-foreground">{r.name}</td>
                    <td className="px-4 py-3 font-mono text-foreground">{r.in}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{r.out}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {r.location}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} label={t(r.status as any)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}