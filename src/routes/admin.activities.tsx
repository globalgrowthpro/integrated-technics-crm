import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { actions, useStoreState, type ActivityType, type ActivityStatus } from "@/lib/store";
import { useMemo, useState } from "react";
import { Phone, Users2, MapPin, Mail, ClipboardCheck, RefreshCw, Plus, CheckCircle2, Circle, PlayCircle, X, Bell, Send, Clock4, Timer } from "lucide-react";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/admin/activities")({
  component: ActivitiesPage,
  head: () => ({ meta: [{ title: "Activities · INT-CRM" }] }),
});

const ICONS: Record<string, any> = {
  Call: Phone, Meeting: Users2, "Site Visit": MapPin, "Follow-up": RefreshCw, Inspection: ClipboardCheck, Email: Mail,
};
const STATUS_ICON: Record<ActivityStatus, any> = { pending: Circle, in_progress: PlayCircle, done: CheckCircle2, cancelled: X };
const STATUS_TONE: Record<ActivityStatus, string> = {
  pending: "text-muted-foreground",
  in_progress: "text-amber-600",
  done: "text-emerald-600",
  cancelled: "text-rose-600",
};
const ACT_I18N: Record<string, any> = { Call: "actCall", Meeting: "actMeeting", "Site Visit": "actSiteVisit", "Follow-up": "actFollowUp", Inspection: "actInspection", Email: "actEmail" };

function ActivitiesPage() {
  const { t } = useI18n();
  const { isAdmin, role } = useRole();
  const { activities, leads, settings } = useStoreState();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reminderFor, setReminderFor] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ActivityType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ActivityStatus>("all");

  const list = useMemo(() => {
    return activities
      .filter((a) => (filter === "all" || a.type === filter) && (statusFilter === "all" || a.status === statusFilter))
      .sort((a, b) => (a.dueDate + a.time).localeCompare(b.dueDate + b.time));
  }, [activities, filter, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof list>();
    for (const a of list) {
      const arr = map.get(a.dueDate) ?? [];
      arr.push(a);
      map.set(a.dueDate, arr);
    }
    return Array.from(map.entries());
  }, [list]);

  const today = new Date().toISOString().slice(0, 10);
  const dailyHours = useMemo(() => {
    const map = new Map<string, { done: number; planned: number; count: number }>();
    for (const a of activities) {
      if (a.dueDate !== today) continue;
      const cur = map.get(a.owner) ?? { done: 0, planned: 0, count: 0 };
      const m = a.estMinutes ?? 0;
      if (a.status === "done") cur.done += m;
      else cur.planned += m;
      cur.count += 1;
      map.set(a.owner, cur);
    }
    return Array.from(map.entries()).sort((a, b) => (b[1].done + b[1].planned) - (a[1].done + a[1].planned));
  }, [activities, today]);

  const fmtH = (mins: number) => {
    const h = Math.floor(mins / 60); const m = mins % 60;
    return h ? `${h}h ${m ? `${m}m` : ""}`.trim() : `${m}m`;
  };

  return (
    <AppShell panel={role} user={{ name: "hafez Rahim", role: t(role as any), initials: "HR" }} pageTitle={t("activities")}>
      <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Clock4 className="h-4 w-4" /></div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">{t("dailyWorkingHoursToday")}</h3>
            <p className="text-xs text-muted-foreground">{t("totalEstimatedTime")}</p>
          </div>
        </div>
        {dailyHours.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noActivitiesToday")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dailyHours.map(([owner, v]) => {
              const total = v.done + v.planned;
              const pct = Math.min(100, Math.round((v.done / Math.max(60 * 8, total)) * 100));
              return (
                <div key={owner} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{owner.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                      <div>
                        <div className="font-semibold text-foreground">{owner}</div>
                        <div className="text-[11px] text-muted-foreground">{v.count} action(s)</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="font-mono text-lg font-bold text-foreground">{fmtH(total)}</div>
                      <div className="text-[10px] uppercase tracking-wider text-emerald-600">{fmtH(v.done)} done</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-gradient-to-r from-primary to-orange-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...settings.activityTypes] as const).map((tp) => (
            <button
              key={tp}
              onClick={() => setFilter(tp as any)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === tp ? "bg-primary text-primary-foreground" : "bg-card text-foreground ring-1 ring-border hover:bg-accent"
                }`}
            >
              {tp === "all" ? t("all") : (ACT_I18N[tp] ? t(ACT_I18N[tp]) : tp)}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-9 rounded-lg border border-border bg-card px-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">{t("all")} — {t("status")}</option>
          <option value="pending">{t("pending")}</option>
          <option value="in_progress">{t("inProgress")}</option>
          <option value="done">{t("done")}</option>
          <option value="cancelled">{t("cancelled")}</option>
        </select>
        <button
          onClick={() => setOpen(true)}
          className="ms-auto inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> {t("addActivity")}
        </button>
      </div>

      <div className="space-y-6">
        {grouped.map(([date, items]) => (
          <div key={date}>
            <div className="mb-2 flex items-center gap-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">{date}</h3>
              <span className="text-xs text-muted-foreground">{items.length} item(s) · {fmtH(items.reduce((s, a) => s + (a.estMinutes ?? 0), 0))} total</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-2">
              {items.map((a) => {
                const Icon = ICONS[a.type] ?? Circle;
                const SIcon = STATUS_ICON[a.status];
                const lead = leads.find((l) => l.id === a.leadId);
                return (
                  <div
                    key={a.id}
                    onClick={() => navigate({ to: "/admin/activities/$activityId", params: { activityId: a.id } })}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition hover:border-primary/40 cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{a.title}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{ACT_I18N[a.type] ? t(ACT_I18N[a.type]) : a.type}</span>
                        {a.estMinutes != null && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/20"><Timer className="h-3 w-3" /> {fmtH(a.estMinutes)}</span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{a.owner} · {a.time}{lead ? ` · ${lead.company}` : a.projectId ? ` · ${a.projectId}` : ""}</span>
                        {a.presalesTeam && a.presalesTeam.length > 0 && (
                          <div className="flex -space-x-1" title={t("presalesTeam")}>
                            {a.presalesTeam.map((p) => (
                              <div key={p} className="flex h-4 w-4 items-center justify-center rounded-full border border-card bg-secondary text-[8px] font-bold text-foreground">
                                {p.split(" ").map(w => w[0]).join("").slice(0, 2)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {a.notes && <div className="mt-1 text-xs text-muted-foreground">📝 {a.notes}</div>}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${STATUS_TONE[a.status]}`}>
                      <SIcon className="h-4 w-4" />
                      <span className="capitalize">
                        {a.status === "done" ? "Attended" : a.status === "cancelled" ? "Not Attended" : "Postponed"}
                      </span>
                    </div>
                    {a.status !== "done" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setReminderFor(a.id); }}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20 hover:bg-primary/20"
                        title="Send reminder"
                      >
                        <Bell className="h-3.5 w-3.5" /> Remind
                      </button>
                    )}
                    {a.status !== "done" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); actions.setActivityStatus(a.id, "done"); }}
                        className={`rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 ${isAdmin ? "" : "opacity-50 pointer-events-none"}`}
                      >
                        {t("markDone")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No activities match these filters.
          </div>
        )}
      </div>

      {open && <NewActivityDialog onClose={() => setOpen(false)} />}
      {reminderFor && <ReminderDialog activityId={reminderFor} onClose={() => setReminderFor(null)} />}
    </AppShell>
  );
}

function ReminderDialog({ activityId, onClose }: { activityId: string; onClose: () => void }) {
  const { t } = useI18n();
  const { activities, leads, settings } = useStoreState();
  const activity = activities.find((a) => a.id === activityId);
  const channelTemplates = settings.templates.filter((t) => t.channel === "Email" || t.channel === "WhatsApp" || t.channel === "SMS");
  const [templateId, setTemplateId] = useState(channelTemplates[0]?.id ?? "");
  const [sent, setSent] = useState(false);
  if (!activity) return null;
  const template = settings.templates.find((t) => t.id === templateId);
  const lead = activity.leadId ? leads.find((l) => l.id === activity.leadId) : undefined;
  const fill = (s: string) => s
    .replaceAll("{{contact}}", lead?.contact ?? "there")
    .replaceAll("{{company}}", lead?.company ?? activity.projectId ?? "—")
    .replaceAll("{{date}}", activity.dueDate)
    .replaceAll("{{time}}", activity.time);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground inline-flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Send Reminder</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="mb-3 rounded-lg bg-secondary/50 p-3 text-xs">
          <div className="font-semibold text-foreground">{activity.title}</div>
          <div className="text-muted-foreground">{activity.dueDate} {activity.time} · {activity.owner}{lead ? ` · ${lead.company}` : ""}</div>
        </div>
        <label className="block">
          <div className="mb-1 text-xs font-semibold text-muted-foreground">Template (Email / WhatsApp / SMS)</div>
          <select value={templateId} onChange={(e) => { setTemplateId(e.target.value); setSent(false); }} className="h-10 w-full rounded-lg border border-border bg-background px-2 text-sm">
            {channelTemplates.map((t) => <option key={t.id} value={t.id}>[{t.channel}] {t.name}</option>)}
          </select>
        </label>
        {template && (
          <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{template.channel} preview</div>
            {template.subject && <div className="mt-1 font-semibold text-foreground">{fill(template.subject)}</div>}
            <div className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{fill(template.body)}</div>
          </div>
        )}
        {sent && <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">✓ {t("reminderDispatched")}</div>}
        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">{t("close")}</button>
          <button
            disabled={!template || sent}
            onClick={() => { if (template) { actions.sendReminder(activityId, template.id); setSent(true); } }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] hover:bg-primary/90 disabled:opacity-60"
          >
            <Send className="h-4 w-4" /> {sent ? "Sent" : `Send via ${template?.channel ?? ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewActivityDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { leads, settings } = useStoreState();
  const [form, setForm] = useState({
    type: settings.activityTypes[0],
    title: "",
    leadId: leads[0]?.id ?? "",
    dueDate: new Date().toISOString().slice(0, 10),
    time: "10:00",
    owner: "hafez Rahim",
    notes: "",
    estMinutes: 30,
  });

  const submit = () => {
    if (!form.title.trim()) return;
    actions.addActivity({
      type: form.type as ActivityType,
      title: form.title,
      leadId: form.leadId || undefined,
      dueDate: form.dueDate,
      time: form.time,
      owner: form.owner,
      notes: form.notes || undefined,
      estMinutes: Number(form.estMinutes) || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">{t("addActivity")}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <Field label={t("type")}>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })} className="input">
              {settings.activityTypes.map((tp) => <option key={tp} value={tp}>{ACT_I18N[tp] ? t(ACT_I18N[tp]) : tp}</option>)}
            </select>
          </Field>
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="e.g. Discovery call — Acme" />
          </Field>
          <Field label="Lead">
            <select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })} className="input">
              <option value="">— None (project) —</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.company}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("dueDate")}>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input" />
            </Field>
            <Field label={t("time")}>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input" />
            </Field>
          </div>
          <Field label="Estimated time (minutes)">
            <input type="number" min={0} step={5} value={form.estMinutes} onChange={(e) => setForm({ ...form, estMinutes: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input min-h-[70px]" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">{t("cancel")}</button>
          <button onClick={submit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{t("save")}</button>
        </div>
      </div>
      <style>{`.input{ width:100%; height:38px; padding:0 10px; border-radius:8px; border:1px solid hsl(var(--border)); background:hsl(var(--background)); font-size:14px; color:hsl(var(--foreground)); } .input:focus{ outline:none; border-color:hsl(var(--primary)); box-shadow:0 0 0 3px color-mix(in oklab, hsl(var(--primary)) 20%, transparent); } textarea.input{height:auto; padding:8px 10px;}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}