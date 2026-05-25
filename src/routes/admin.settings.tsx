import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { actions, useStoreState } from "@/lib/store";
import { useRole } from "@/lib/role";
import { useState } from "react";
import { Workflow, Tag, CalendarCheck, Zap, MessageSquare, Plus, Check, ShieldAlert, MapPin, X, Users as UsersIcon, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { APP_PAGES, USER_ROLES, type AppPage, type CrudOp, type UserRoleKey, type AppUser } from "@/lib/store";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings · INT-CRM" }] }),
});

const TABS = [
  { key: "statuses", label: "Lead Statuses", icon: Tag },
  { key: "stages", label: "Pipeline Stages", icon: Workflow },
  { key: "activities", label: "Activity Types", icon: CalendarCheck },
  { key: "locations", label: "Locations", icon: MapPin },
  { key: "users", label: "Users & Permissions", icon: UsersIcon },
  { key: "automations", label: "Automations", icon: Zap },
  { key: "templates", label: "Templates", icon: MessageSquare },
] as const;

function SettingsPage() {
  const { t } = useI18n();
  const { isAdmin } = useRole();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("statuses");
  const { settings } = useStoreState();
  const [newType, setNewType] = useState("");

  if (!isAdmin) {
    return (
      <AppShell panel="admin" user={{ name: "Employee", role: t("employee"), initials: "EM" }} pageTitle={t("settings")}>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">{t("accessRestricted")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("accessRestrictedMsg")}</p>
          <Link to="/employee" className="mt-5 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{t("goToEmployeePanel")}</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell panel="admin" user={{ name: "hafez Rahim", role: t("admin"), initials: "HR" }} pageTitle={t("settings")}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-soft)] lg:sticky lg:top-20 lg:self-start">
          {TABS.map((it) => {
            const Icon = it.icon;
            const active = tab === it.key;
            return (
              <button
                key={it.key}
                onClick={() => setTab(it.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {t(it.key === "statuses" ? "leadStatuses" : it.key === "stages" ? "pipelineStages" : it.key === "activities" ? "activityTypes" : it.key as any) ?? it.label}
              </button>
            );
          })}
        </aside>

        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          {tab === "statuses" && (
            <section>
              <Header title={t("leadStatuses")} hint={t("statusesDesc")} />
              <div className="flex flex-wrap gap-2">
                {settings.statuses.map((s) => (
                  <span key={s} className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-semibold capitalize text-primary ring-1 ring-orange-200">{t(s as any) ?? s}</span>
                ))}
              </div>
            </section>
          )}

          {tab === "stages" && (
            <section>
              <Header title={t("pipelineStages")} hint={t("stagesDesc")} />
              <div className="space-y-2">
                {settings.stages.map((st) => (
                  <StageRow key={st.key} stageKey={st.key} label={st.label} color={st.color} />
                ))}
              </div>
            </section>
          )}

          {tab === "activities" && (
            <section>
              <Header title={t("activityTypes")} hint={t("activityTypesDesc")} />
              <div className="mb-4 flex gap-2">
                <input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g. Demo, Workshop" className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button
                  onClick={() => { if (newType.trim()) { actions.addActivityType(newType.trim()); setNewType(""); } }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.activityTypes.map((tp) => (
                  <span key={tp} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground ring-1 ring-border">{tp}</span>
                ))}
              </div>
            </section>
          )}

          {tab === "locations" && (
            <section>
              <Header title={t("locations")} hint={t("locationsDesc")} />
              <LocationsEditor cities={settings.locations} />
            </section>
          )}

          {tab === "users" && (
            <section>
              <Header title="Users & Permissions" hint="Manage users and configure allowed pages and CRUD operations per role." />
              <UsersEditor />
              <div className="mt-8">
                <h3 className="mb-3 font-display text-base font-bold text-foreground">Role permissions</h3>
                <PermissionsMatrix />
              </div>
            </section>
          )}

          {tab === "automations" && (
            <section>
              <Header title={t("automations")} hint={t("automationsDesc")} />
              <div className="divide-y divide-border rounded-lg border border-border">
                {settings.automations.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground"><b>{t("when")}</b> {r.trigger} <b>→</b> {r.action}</div>
                    </div>
                    <button
                      onClick={() => actions.toggleAutomation(r.id)}
                      className={`relative h-6 w-11 rounded-full transition ${r.enabled ? "bg-primary" : "bg-muted"}`}
                      aria-label="Toggle"
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${r.enabled ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "templates" && (
            <section>
              <Header title={t("templates")} hint={t("templatesDesc")} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {settings.templates.map((tp) => (
                  <div key={tp.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-foreground">{tp.name}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tp.channel}</span>
                    </div>
                    {tp.subject && <div className="mb-1 text-xs text-muted-foreground">{tp.subject}</div>}
                    <div className="rounded-lg bg-secondary/50 p-3 text-xs leading-relaxed text-foreground">{tp.body}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Header({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-5 border-b border-border pb-4">
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function UsersEditor() {
  const { users, settings } = useStoreState();
  const [draft, setDraft] = useState<{ name: string; email: string; role: UserRoleKey }>({ name: "", email: "", role: "employee" });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_160px_auto]">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRoleKey })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm capitalize focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
          {USER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={() => {
            if (!draft.name.trim() || !draft.email.trim()) return;
            actions.addUser({ name: draft.name.trim(), email: draft.email.trim(), role: draft.role, active: true });
            setDraft({ name: "", email: "", role: "employee" });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add user
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-start">Name</th>
              <th className="px-3 py-2 text-start">Email</th>
              <th className="px-3 py-2 text-start">Role</th>
              <th className="px-3 py-2 text-start">Active</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => <UserRow key={u.id} user={u} />)}
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No users yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{Object.keys(settings.permissions).length} role profiles configured.</p>
    </div>
  );
}

function UserRow({ user }: { user: AppUser }) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(user);
  return (
    <tr className="bg-background">
      <td className="px-3 py-2">
        {edit ? <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="h-8 w-full rounded border border-border bg-card px-2 text-sm" /> : <span className="font-semibold text-foreground">{user.name}</span>}
      </td>
      <td className="px-3 py-2">
        {edit ? <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="h-8 w-full rounded border border-border bg-card px-2 text-sm" /> : <span className="text-muted-foreground">{user.email}</span>}
      </td>
      <td className="px-3 py-2">
        {edit ? (
          <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRoleKey })} className="h-8 rounded border border-border bg-card px-2 text-sm capitalize">
            {USER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        ) : (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold capitalize text-primary">{user.role}</span>
        )}
      </td>
      <td className="px-3 py-2">
        <button
          onClick={() => actions.updateUser(user.id, { active: !user.active })}
          className={`relative h-5 w-9 rounded-full transition ${user.active ? "bg-primary" : "bg-muted"}`}
          aria-label="Toggle active"
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${user.active ? "left-[18px]" : "left-0.5"}`} />
        </button>
      </td>
      <td className="px-3 py-2 text-end">
        <div className="inline-flex items-center gap-2">
          {edit ? (
            <>
              <button onClick={() => { actions.updateUser(user.id, draft); setEdit(false); }} className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Save</button>
              <button onClick={() => { setDraft(user); setEdit(false); }} className="rounded border border-border px-2 py-1 text-xs">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEdit(true)} className="rounded border border-border px-2 py-1 text-xs font-semibold">Edit</button>
          )}
          <button onClick={() => { if (confirm(`Delete ${user.name}?`)) actions.removeUser(user.id); }} className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600"><Trash2 className="h-3 w-3" /></button>
        </div>
      </td>
    </tr>
  );
}

function PermissionsMatrix() {
  const { settings } = useStoreState();
  const CRUD: CrudOp[] = ["create", "read", "update", "delete"];
  return (
    <div className="space-y-4">
      {USER_ROLES.map((role) => (
        <div key={role} className="rounded-xl border border-border bg-background p-4">
          <div className="mb-3 font-display text-sm font-bold capitalize text-foreground">{role}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="px-2 py-1 text-start font-semibold">Page</th>
                  {CRUD.map((op) => <th key={op} className="px-2 py-1 text-center font-semibold capitalize">{op}</th>)}
                </tr>
              </thead>
              <tbody>
                {APP_PAGES.map((page) => {
                  const ops = settings.permissions[role]?.crud[page] ?? [];
                  return (
                    <tr key={page} className="border-t border-border">
                      <td className="px-2 py-1.5 font-semibold capitalize text-foreground">{page}</td>
                      {CRUD.map((op) => {
                        const checked = ops.includes(op);
                        return (
                          <td key={op} className="px-2 py-1.5 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={role === "admin"}
                              onChange={(e) => {
                                const next = e.target.checked ? Array.from(new Set([...ops, op])) : ops.filter((x) => x !== op);
                                actions.setRolePermission(role as UserRoleKey, page as AppPage, next);
                              }}
                              className="h-4 w-4 cursor-pointer accent-primary"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Admin role always has full access.</p>
    </div>
  );
}


function LocationsEditor({ cities }: { cities: { name: string; districts: string[] }[] }) {
  const { t } = useI18n();
  const [newCity, setNewCity] = useState("");
  const [newDistrict, setNewDistrict] = useState<Record<string, string>>({});
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder={t("addCity")}
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => { if (newCity.trim()) { actions.addCity(newCity.trim()); setNewCity(""); } }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> {t("addCity")}
        </button>
      </div>
      <div className="space-y-3">
        {cities.map((c) => (
          <div key={c.name} className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-display text-base font-bold text-foreground">{c.name}</span>
                <span className="text-xs text-muted-foreground">({c.districts.length} districts)</span>
              </div>
              <button
                onClick={() => { if (confirm(`${t("removeCity")} "${c.name}"?`)) actions.removeCity(c.name); }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                {t("remove")}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.districts.map((d) => (
                <span key={d} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-border">
                  {d}
                  <button onClick={() => actions.removeDistrict(c.name, d)} className="text-muted-foreground hover:text-rose-600" aria-label={`Remove ${d}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {c.districts.length === 0 && <span className="text-xs text-muted-foreground">{t("noDistrictsYet")}</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={newDistrict[c.name] ?? ""}
                onChange={(e) => setNewDistrict({ ...newDistrict, [c.name]: e.target.value })}
                placeholder={`${t("addDistrictTo")} ${c.name}`}
                className="h-9 flex-1 rounded-md border border-border bg-card px-2 text-sm focus:border-primary focus:outline-none"
              />
              <button
                onClick={() => {
                  const v = (newDistrict[c.name] ?? "").trim();
                  if (v) { actions.addDistrict(c.name, v); setNewDistrict({ ...newDistrict, [c.name]: "" }); }
                }}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" /> {t("add")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StageRow({ stageKey, label, color }: { stageKey: string; label: string; color: string }) {
  const { t } = useI18n();
  const [val, setVal] = useState(label);
  const dirty = val !== label;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{t(stageKey as any) ?? stageKey}</span>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="h-9 flex-1 rounded-md border border-border bg-card px-2 text-sm focus:border-primary focus:outline-none"
      />
      <button
        disabled={!dirty}
        onClick={() => actions.renameStage(stageKey, val)}
        className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${dirty ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"
          }`}
      >
        <Check className="h-3.5 w-3.5" /> {t("save")}
      </button>
    </div>
  );
}