import { Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { LocationPicker } from "@/components/LocationPicker";
import { useI18n } from "@/lib/i18n";
import { fmtMoney } from "@/lib/mock-data";
import { actions, useStoreState } from "@/lib/store";
import { useRole } from "@/lib/role";
import { useRef, useState } from "react";
import { ArrowLeft, Paperclip, FileText, Plus, Phone, Mail, MapPin, Building2, User, DollarSign, History as HistoryIcon, CalendarCheck, Workflow, Clock4, Timer } from "lucide-react";

function fmtTime(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  // Stable, locale-independent format to avoid SSR/client hydration mismatch
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LeadDetailsPage({ leadId }: { leadId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const { isAdmin } = useRole();
  const panel = isAdmin ? "admin" : "employee";
  const user = isAdmin
    ? { name: "hafez Rahim", role: t("admin"), initials: "HR" }
    : { name: "hafez Rahim", role: t("employee"), initials: "HR" };
  const { leads, notes, attachments, activities, history, settings, leadDistricts } = useStoreState();
  const lead = leads.find((l) => l.id === leadId);
  const [noteText, setNoteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!lead) {
    return (
      <AppShell panel={panel} user={user} pageTitle="Lead">
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Lead <span className="font-mono">{leadId}</span> not found.</p>
          <Link to="/admin/leads" className="mt-3 inline-block text-sm font-semibold text-primary">{t("backToLeads")}</Link>
        </div>
      </AppShell>
    );
  }

  const leadNotes = notes.filter((n) => n.leadId === leadId);
  const leadFiles = attachments.filter((a) => a.leadId === leadId);
  const leadActivities = activities.filter((a) => a.leadId === leadId);
  const leadHistory = history.filter((h) => h.target === lead.company);
  const stageHistory = leadHistory.filter((h) => h.module === "pipeline");

  // Time spent per employee on this lead
  const timeByOwner = new Map<string, { mins: number; count: number }>();
  for (const a of leadActivities) {
    const cur = timeByOwner.get(a.owner) ?? { mins: 0, count: 0 };
    cur.mins += a.estMinutes ?? 0; cur.count += 1;
    timeByOwner.set(a.owner, cur);
  }
  const totalMins = Array.from(timeByOwner.values()).reduce((s, v) => s + v.mins, 0);
  const fmtH = (mins: number) => {
    const h = Math.floor(mins / 60); const m = mins % 60;
    return mins ? (h ? `${h}h ${m ? `${m}m` : ""}`.trim() : `${m}m`) : "0";
  };

  return (
    <AppShell panel={panel} user={user} pageTitle={lead.company}>
      <button onClick={() => router.history.back()} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> {t("backToLeads")}
      </button>

      {/* Header card */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-extrabold text-foreground">{lead.company}</h2>
              <StatusBadge status={lead.status} label={t(lead.status as any)} />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {lead.contact}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {lead.industry}</span>
              <span className="inline-flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> {fmtMoney(lead.value)}</span>
              <span className="font-mono text-xs">{lead.id}</span>
            </div>
            <LocationPicker
              cities={settings.locations}
              city={lead.city}
              district={leadDistricts[lead.id] ?? ""}
              onChange={(city, district) => actions.setLeadLocation(lead.id, city, district)}
            />
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-accent"><Phone className="h-4 w-4" /> Call</button>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-accent"><Mail className="h-4 w-4" /> Email</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Timeline */}
        <div className="lg:col-span-2">
          <Section title={t("timeline")} icon={HistoryIcon}>
            <ol className="relative ms-3 border-s border-border ps-5">
              {leadHistory.length === 0 && <li className="text-sm text-muted-foreground">No history yet.</li>}
              {leadHistory.map((h) => (
                <li key={h.id} className="relative pb-5 last:pb-0">
                  <span className="absolute -start-[27px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="text-xs text-muted-foreground">{fmtTime(h.ts)} · <span className="font-semibold text-foreground">{h.actor}</span></div>
                  <div className="text-sm font-semibold text-foreground">{h.action}</div>
                  {h.details && <div className="text-xs text-muted-foreground">{h.details}</div>}
                </li>
              ))}
            </ol>
          </Section>

          <Section title={t("relatedActivities")} icon={CalendarCheck}>
            {leadActivities.length > 0 && (
              <div className="mb-4 rounded-xl bg-secondary/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Clock4 className="h-3.5 w-3.5 text-primary" /> Time spent on this lead
                  </div>
                  <div className="font-mono text-lg font-bold text-foreground">{fmtH(totalMins)}</div>
                </div>
                <div className="space-y-1.5">
                  {Array.from(timeByOwner.entries()).map(([owner, v]) => (
                    <div key={owner} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{owner} <span className="text-muted-foreground">· {v.count} action(s)</span></span>
                      <span className="font-mono font-bold text-primary">{fmtH(v.mins)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {leadActivities.length === 0 && <p className="text-sm text-muted-foreground">No activities linked to this lead.</p>}
            <div className="space-y-2">
              {leadActivities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{a.type}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.dueDate} {a.time} · {a.owner}</div>
                  </div>
                  {a.estMinutes != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/20"><Timer className="h-3 w-3" /> {fmtH(a.estMinutes)}</span>
                  )}
                  <span className="text-xs font-semibold capitalize text-muted-foreground">{a.status.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t("stageHistory")} icon={Workflow}>
            {stageHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stage changes yet — drag this lead on the Pipeline board to log one.</p>
            ) : (
              <div className="space-y-2">
                {stageHistory.map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 text-sm">
                    <span className="font-semibold text-foreground">{h.details || h.action}</span>
                    <span className="text-xs text-muted-foreground">{fmtTime(h.ts)} · {h.actor}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Right: Notes + Attachments */}
        <div>
          <Section title={t("notes")} icon={FileText}>
            <div className="mb-3 flex gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a quick note..."
                className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={() => { if (noteText.trim()) { actions.addNote(leadId, noteText.trim()); setNoteText(""); } }}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" /> {t("addNote")}
              </button>
            </div>
            <div className="space-y-2">
              {leadNotes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
              {leadNotes.map((n) => (
                <div key={n.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="text-sm text-foreground">{n.text}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{n.author} · {fmtTime(n.ts)}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t("attachments")} icon={Paperclip}>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const kb = file.size / 1024;
                  const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
                  actions.addAttachment(leadId, file.name, size, "hafez Rahim", reader.result as string, file.type);
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-6 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Paperclip className="h-4 w-4" /> {t("upload")} — saved to this device
            </button>
            <div className="space-y-2">
              {leadFiles.map((f) => (
                <div key={f.id} className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    {f.dataUrl ? (
                      <a href={f.dataUrl} download={f.name} className="truncate block text-sm font-semibold text-foreground hover:text-primary">{f.name}</a>
                    ) : (
                      <div className="truncate text-sm font-semibold text-foreground">{f.name}</div>
                    )}
                    <div className="text-[11px] text-muted-foreground">{f.size} · {fmtTime(f.ts)}</div>
                  </div>
                  <button onClick={() => actions.removeAttachment(f.id)} className="text-[11px] font-semibold text-rose-600 opacity-0 hover:underline group-hover:opacity-100">Delete</button>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}