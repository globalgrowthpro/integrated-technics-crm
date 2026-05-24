import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { employees } from "@/lib/mock-data";
import { useStoreState } from "@/lib/store";
import { Clock4, Download, X, LayoutGrid, List, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/employees")({
  component: EmployeesPage,
  head: () => ({ meta: [{ title: "Employees · INT-CRM" }] }),
});

const DEPT_COLORS: Record<string, string> = {
  Sales: "bg-sky-100 text-sky-700",
  Technical: "bg-violet-100 text-violet-700",
  Operations: "bg-amber-100 text-amber-700",
  HR: "bg-rose-100 text-rose-700",
  Projects: "bg-emerald-100 text-emerald-700",
};

function PerfBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500" style={{ width: `${value}%` }} />
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-600 text-base font-bold text-primary-foreground shadow-[var(--shadow-brand)]">
      {initials}
    </div>
  );
}

function AvatarSm({ initials }: { initials: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-600 text-xs font-bold text-primary-foreground shadow-sm">
      {initials}
    </div>
  );
}

function EmployeesPage() {
  const { t, dir } = useI18n();
  const { activities, leads } = useStoreState();
  const isDetailRoute = useRouterState({
    select: (state) => state.location.pathname.startsWith("/admin/employees/"),
  });
  const today = new Date().toISOString().slice(0, 10);
  const [exportOpen, setExportOpen] = useState(false);
  const [view, setView] = useState<"card" | "table">("card");
  const [dept, setDept] = useState("all");

  const depts = ["all", ...Array.from(new Set(employees.map((e) => e.department)))];

  const hoursToday = (name: string) => {
    const mins = activities.filter((a) => a.owner === name && a.dueDate === today).reduce((s, a) => s + (a.estMinutes ?? 0), 0);
    const h = Math.floor(mins / 60); const m = mins % 60;
    return mins ? (h ? `${h}h ${m ? `${m}m` : ""}`.trim() : `${m}m`) : "—";
  };

  const filtered = useMemo(() =>
    dept === "all" ? employees : employees.filter((e) => e.department === dept),
    [dept]
  );

  const user = { name: "hafez Rahim", role: t("admin"), initials: "HR" };

  if (isDetailRoute) return <Outlet />;

  return (
    <AppShell panel="admin" user={user} pageTitle={t("employees")}>
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Dept filter */}
        <div className="flex flex-wrap gap-1.5">
          {depts.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${dept === d ? "bg-primary text-primary-foreground" : "bg-card text-foreground ring-1 ring-border hover:bg-accent"}`}
            >
              {d === "all" ? t("all") : d}
            </button>
          ))}
        </div>

        <div className="ms-auto flex gap-2">
          {/* View toggle */}
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setView("card")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> {t("cardView")}
            </button>
            <button
              onClick={() => setView("table")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-3.5 w-3.5" /> {t("tableView")}
            </button>
          </div>

          <button
            onClick={() => setExportOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <Download className="h-4 w-4" /> {t("exportHours")}
          </button>
        </div>
      </div>

      {/* ─── CARD VIEW ─── */}
      {view === "card" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const myLeads = leads.filter((l) => l.owner === e.name);
            const won = myLeads.filter((l) => l.status === "won").length;
            return (
              <Link
                key={e.id}
                to="/admin/employees/$employeeId"
                params={{ employeeId: e.id }}
                className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
              >
                {/* Card header */}
                <div className="flex items-center gap-4 p-5 pb-4" style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.08), hsl(var(--primary)/0.02))" }}>
                  <Avatar initials={e.avatar} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-bold text-foreground">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.role}</div>
                    <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${DEPT_COLORS[e.department] ?? "bg-secondary text-foreground"}`}>
                      {e.department}
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="font-mono text-2xl font-extrabold text-primary">{e.perf}%</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("performance")}</div>
                  </div>
                </div>

                <div className="px-5 pb-2">
                  <PerfBar value={e.perf} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-border border-t border-border text-center">
                  <div className="py-3">
                    <div className="font-mono text-lg font-bold text-foreground">{myLeads.length}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("leads")}</div>
                  </div>
                  <div className="py-3">
                    <div className="font-mono text-lg font-bold text-emerald-600">{won}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("won")}</div>
                  </div>
                  <div className="py-3">
                    <div className="inline-flex items-center gap-1 font-mono text-sm font-bold text-foreground">
                      <Clock4 className="h-3.5 w-3.5 text-primary" /> {hoursToday(e.name)}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("today")}</div>
                  </div>
                </div>

                <div className="border-t border-border px-5 py-3">
                  <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary ring-1 ring-primary/20 transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {dir === "rtl" ? "عرض الملف" : "View Profile"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ─── TABLE VIEW ─── */}
      {view === "table" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("name")}</th>
                  <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("role")}</th>
                  <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("department")}</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("leads")}</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("won")}</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("performance")}</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("today")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => {
                  const myLeads = leads.filter((l) => l.owner === e.name);
                  const won = myLeads.filter((l) => l.status === "won").length;
                  return (
                    <tr key={e.id} className="transition hover:bg-primary/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AvatarSm initials={e.avatar} />
                          <div>
                            <div className="font-semibold text-foreground">{e.name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">{e.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{e.role}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${DEPT_COLORS[e.department] ?? "bg-secondary text-foreground"}`}>
                          {e.department}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-foreground">{myLeads.length}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-emerald-600">{won}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1"><PerfBar value={e.perf} /></div>
                          <span className="font-mono text-xs font-bold text-primary">{e.perf}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-foreground">{hoursToday(e.name)}</td>
                      <td className="px-4 py-3 text-end">
                        <Link
                          to="/admin/employees/$employeeId"
                          params={{ employeeId: e.id }}
                          className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20 hover:bg-primary hover:text-primary-foreground"
                        >
                          {dir === "rtl" ? "عرض" : "View"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {exportOpen && <ExportHoursDialog onClose={() => setExportOpen(false)} />}
    </AppShell>
  );
}

function ExportHoursDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { activities } = useStoreState();
  const today = new Date().toISOString().slice(0, 10);
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 6);
  const [from, setFrom] = useState(sevenAgo.toISOString().slice(0, 10));
  const [to, setTo] = useState(today);

  const rows = useMemo(() => {
    const owners = Array.from(new Set(employees.map((e) => e.name)));
    const dates: string[] = [];
    const d = new Date(from);
    const end = new Date(to);
    while (d <= end) { dates.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
    type Row = { emp: string; date: string; hours: string; totalMinutes: number };
    const out: Row[] = [];
    for (const owner of owners) {
      for (const date of dates) {
        const items = activities.filter((a) => a.owner === owner && a.dueDate === date);
        if (items.length === 0) continue;
        const total = items.reduce((s, a) => s + (a.estMinutes ?? 0), 0);
        out.push({ emp: owner, date, hours: (total / 60).toFixed(2) + "h", totalMinutes: total });
      }
    }
    return out;
  }, [activities, from, to]);

  const download = () => {
    const header = ["Employee", "Date", "Hours"];
    const lines = [header.join(",")];
    for (const r of rows) lines.push([`"${r.emp}"`, r.date, r.hours].join(","));
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `working-hours_${from}_to_${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{t("exportHours")}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">{t("dailyWorkingHoursPerEmployee")}</p>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <label className="block">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">{t("from")}</div>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm focus:border-primary focus:outline-none" />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">{t("to")}</div>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm focus:border-primary focus:outline-none" />
          </label>
        </div>
        <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-xs">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground">{t("preview")}</span>
            <span className="font-semibold text-foreground">{rows.length} rows</span>
          </div>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-secondary/60 text-start"><tr><th className="px-2 py-1 text-start">{t("employee")}</th><th className="px-2 py-1 text-start">{t("date")}</th><th className="px-2 py-1 text-end">{t("hours")}</th></tr></thead>
              <tbody className="divide-y divide-border text-foreground">
                {rows.map((r, i) => <tr key={i}><td className="px-2 py-1">{r.emp}</td><td className="px-2 py-1">{r.date}</td><td className="px-2 py-1 text-end">{r.hours}</td></tr>)}
                {rows.length === 0 && <tr><td colSpan={3} className="px-2 py-3 text-center text-muted-foreground">{t("noActivityInRange")}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">{t("cancel")}</button>
          <button onClick={download} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}