import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { useStoreState } from "@/lib/store";
import { useMemo, useState } from "react";
import { Phone, Users2, MapPin, Mail, ClipboardCheck, RefreshCw, Circle, PlayCircle, CheckCircle2, X } from "lucide-react";
import type { ActivityStatus } from "@/lib/store";

export const Route = createFileRoute("/manager/activities")({
  component: ManagerActivitiesPage,
  head: () => ({ meta: [{ title: "Team Activities · INT-CRM" }] }),
});

const ICONS: Record<string, any> = {
  Call: Phone, Meeting: Users2, "Site Visit": MapPin, "Follow-up": RefreshCw, Inspection: ClipboardCheck, Email: Mail,
};
const STATUS_ICON: Record<ActivityStatus, any> = { pending: Circle, in_progress: PlayCircle, done: CheckCircle2, cancelled: X };
const STATUS_TONE: Record<ActivityStatus, string> = {
  pending: "text-muted-foreground", in_progress: "text-amber-600", done: "text-emerald-600", cancelled: "text-rose-600",
};

function ManagerActivitiesPage() {
  const { t } = useI18n();
  const { activities, leads } = useStoreState();
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState<"all" | ActivityStatus>("all");

  const owners = ["all", ...Array.from(new Set(activities.map((a) => a.owner)))];

  const filtered = useMemo(() =>
    activities
      .filter((a) => (owner === "all" || a.owner === owner) && (status === "all" || a.status === status))
      .sort((a, b) => (a.dueDate + a.time).localeCompare(b.dueDate + b.time)),
    [activities, owner, status]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const a of filtered) {
      const arr = map.get(a.dueDate) ?? [];
      arr.push(a);
      map.set(a.dueDate, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const fmtH = (mins: number) => {
    const h = Math.floor(mins / 60); const m = mins % 60;
    return h ? `${h}h ${m ? `${m}m` : ""}`.trim() : `${m}m`;
  };

  return (
    <AppShell panel="manager" user={{ name: "hafez Rahim", role: t("manager"), initials: "HR" }} pageTitle={t("activities")}>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {owners.map((o) => (
            <button
              key={o}
              onClick={() => setOwner(o)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${owner === o ? "bg-primary text-primary-foreground" : "bg-card text-foreground ring-1 ring-border hover:bg-accent"}`}
            >
              {o === "all" ? t("all") : o.split(" ")[0]}
            </button>
          ))}
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="h-9 rounded-lg border border-border bg-card px-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">{t("all")} — {t("status")}</option>
          <option value="pending">{t("pending")}</option>
          <option value="in_progress">{t("inProgress")}</option>
          <option value="done">{t("done")}</option>
          <option value="cancelled">{t("cancelled")}</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["pending", "in_progress", "done", "cancelled"] as ActivityStatus[]).map((s) => {
          const count = activities.filter((a) => a.status === s && (owner === "all" || a.owner === owner)).length;
          return (
            <div key={s} className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
              <div className={`text-2xl font-bold ${STATUS_TONE[s]}`}>{count}</div>
              <div className="mt-1 text-xs capitalize text-muted-foreground">{s.replace("_", " ")}</div>
            </div>
          );
        })}
      </div>

      {/* Activity groups */}
      <div className="space-y-6">
        {grouped.map(([date, items]) => (
          <div key={date}>
            <div className="mb-2 flex items-center gap-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">{date}</h3>
              <span className="text-xs text-muted-foreground">{items.length} item(s) · {fmtH(items.reduce((s, a) => s + (a.estMinutes ?? 0), 0))}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-2">
              {items.map((a) => {
                const Icon = ICONS[a.type] ?? Circle;
                const SIcon = STATUS_ICON[a.status];
                const lead = leads.find((l) => l.id === a.leadId);
                return (
                  <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.owner} · {a.time}{lead ? ` · ${lead.company}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary" title={t("owner")}>
                        {a.owner.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      {a.presalesTeam && a.presalesTeam.length > 0 && (
                        <>
                          <div className="h-4 w-px bg-border" />
                          <div className="flex -space-x-1.5" title={t("presalesTeam")}>
                            {a.presalesTeam.map((p) => (
                              <div key={p} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-secondary text-[9px] font-bold text-foreground">
                                {p.split(" ").map(w => w[0]).join("").slice(0, 2)}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${STATUS_TONE[a.status]}`}>
                      <SIcon className="h-4 w-4" />
                      <span className="capitalize">
                        {a.status === "done" ? "Attended" : a.status === "cancelled" ? "Not Attended" : "Postponed"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            {t("nothingHere")}
          </div>
        )}
      </div>
    </AppShell>
  );
}
