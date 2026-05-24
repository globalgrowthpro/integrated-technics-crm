import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { fmtMoney } from "@/lib/mock-data";
import { actions, useStoreState, type Project } from "@/lib/store";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Users2 } from "lucide-react";

export const Route = createFileRoute("/employee/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { t } = useI18n();
  const { projects } = useStoreState();
  const [editing, setEditing] = useState<Project | "new" | null>(null);

  return (
    <AppShell panel="employee" user={{ name: "hafez Rahim", role: t("employee"), initials: "HR" }} pageTitle={t("myProjects")}>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] hover:bg-primary/90">
          <Plus className="h-4 w-4" /> {t("addProject")}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {projects.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition hover:border-primary">
            <Link to="/admin/projects/$projectId" params={{ projectId: p.id }} className="block">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.id} {p.category && `· ${p.category}`}</div>
                  <h3 className="mt-1 font-display text-base font-bold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.client}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("progress")}</span>
                  <span className="font-mono font-bold text-foreground">{p.progress}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${p.progress}%`,
                      background:
                        p.status === "Delayed"
                          ? "oklch(0.62 0.22 27)"
                          : p.status === "At Risk"
                            ? "oklch(0.78 0.15 80)"
                            : "oklch(0.706 0.181 49.5)",
                    }}
                  />
                </div>
              </div>

              {p.competitors && p.competitors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.competitors.map(c => (
                    <span key={c} className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600 ring-1 ring-inset ring-rose-200">
                      VS {c}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users2 className="h-3.5 w-3.5" />
                  <span>{p.team} {t("members")}</span>
                </div>
                <div className="text-end">
                  <div className="font-mono font-bold text-primary">{fmtMoney(p.budget)}</div>
                  {p.offeredValue && <div className="text-[9px] text-muted-foreground uppercase">{t("offeredValue")}: {fmtMoney(p.offeredValue)}</div>}
                </div>
              </div>
            </Link>
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <button onClick={() => setEditing(p)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary px-2 py-1.5 text-xs font-semibold hover:bg-accent">
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button onClick={() => { if (confirm(`Delete project ${p.name}?`)) actions.removeProject(p.id); }} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No projects yet.</div>
        )}
      </div>
      {editing && <ProjectFormModal initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </AppShell>
  );
}

function ProjectFormModal({ initial, onClose }: { initial: Project | null; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [status, setStatus] = useState(initial?.status ?? "On Track");
  const [progress, setProgress] = useState(initial?.progress ?? 0);
  const [budget, setBudget] = useState(initial?.budget ?? 0);
  const [team, setTeam] = useState(initial?.team ?? 1);

  const submit = () => {
    if (!name.trim()) return;
    const data = { name, client, status, progress, budget, team, offeredValue: 0, competitors: [], category: "", lastUpdate: new Date().toISOString().slice(0, 10) };
    if (initial) actions.updateProject(initial.id, data);
    else actions.addProject(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{initial ? "Edit project" : "Add project"}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <L label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></L>
          <L label="Client"><input value={client} onChange={(e) => setClient(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></L>
          <L label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm">
              {["On Track", "At Risk", "Delayed", "Completed"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </L>
          <L label="Progress %"><input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></L>
          <L label="Budget (EGP)"><input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></L>
          <L label="Team size"><input type="number" min={1} value={team} onChange={(e) => setTeam(Number(e.target.value))} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></L>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">Cancel</button>
          <button onClick={submit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{initial ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}