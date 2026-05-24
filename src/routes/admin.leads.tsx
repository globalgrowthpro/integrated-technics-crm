import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { fmtMoney } from "@/lib/mock-data";
import { actions, useStoreState, type LocationCity } from "@/lib/store";
import { useRole } from "@/lib/role";
import { Plus, Filter, Download, Search, List, Map as MapIcon, Pencil, Trash2, X } from "lucide-react";
import { useState, useEffect, type ComponentType } from "react";
import type { Lead, LeadStatus } from "@/lib/mock-data";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];

export const Route = createFileRoute("/admin/leads")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "Leads · INT-CRM" }] }),
});

function LeadsPage() {
  const { t } = useI18n();
  const { leads, settings, leadDistricts } = useStoreState();
  const isDetailRoute = useRouterState({
    select: (state) => state.location.pathname.startsWith("/admin/leads/")
  });
  const [tab, setTab] = useState<"list" | "map">("list");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Lead | "new" | null>(null);
  const [LeadsMap, setLeadsMap] = useState<ComponentType<{ leads: Lead[] }> | null>(null);
  useEffect(() => {
    if (tab === "map" && !LeadsMap) {
      import("@/components/LeadsMap").then((m) => setLeadsMap(() => m.LeadsMap));
    }
  }, [tab, LeadsMap]);
  const { role, isAdmin } = useRole();
  const user = { name: "hafez Rahim", role: t(role as any), initials: "HR" };

  if (isDetailRoute) {
    return <Outlet />;
  }

  const filtered = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!l.company.toLowerCase().includes(q) && !l.contact.toLowerCase().includes(q) && !l.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <AppShell panel={role} user={user} pageTitle={t("leads")}>
      <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1 shadow-[var(--shadow-soft)]">
        <button
          onClick={() => setTab("list")}
          className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${tab === "list" ? "bg-primary text-primary-foreground shadow-[var(--shadow-brand)]" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <List className="h-4 w-4" /> {t("listView")}
        </button>
        <button
          onClick={() => setTab("map")}
          className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${tab === "map" ? "bg-primary text-primary-foreground shadow-[var(--shadow-brand)]" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <MapIcon className="h-4 w-4" /> {t("map")}
        </button>
      </div>

      {tab === "map" ? (
        LeadsMap ? (
          <LeadsMap leads={filtered} />
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">{t("loadingMap")}</div>
        )
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" style={{ insetInlineStart: "0.75rem" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search")}
                className="h-10 w-full rounded-lg border border-border bg-card text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ paddingInlineStart: "2.25rem", paddingInlineEnd: "0.75rem" }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
                aria-label={t("filterByStatus")}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t("filterByStatus")}: {t("all")}</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{t(s as any)}</option>
                ))}
              </select>
              <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-accent">
                <Filter className="h-4 w-4" /> {t("filters")}
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-accent">
                <Download className="h-4 w-4" /> {t("export")}
              </button>
              <button onClick={() => setEditing("new")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] hover:bg-primary/90">
                <Plus className="h-4 w-4" /> {t("addLead")}
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
            <div className="overflow-x-auto">
              <div className="min-w-[1200px] text-sm">
                <div
                  className="grid items-center gap-2 bg-secondary/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ gridTemplateColumns: "80px 1.4fr 1fr 0.9fr 0.9fr 0.8fr 0.9fr 0.8fr 1fr 110px 90px" }}
                >
                  <div>ID</div>
                  <div>{t("company")}</div>
                  <div>{t("contact")}</div>
                  <div>City</div>
                  <div>{t("district")}</div>
                  <div>{t("source")}</div>
                  <div>{t("status")} / %</div>
                  <div>{t("owner")}</div>
                  <div className="text-end">{t("value")}</div>
                  <div className="text-end">{t("action")}</div>
                </div>
                <div className="divide-y divide-border">
                  {filtered.map((l) => (
                    <div
                      key={l.id}
                      className="grid items-center gap-2 px-4 py-3 transition-colors hover:bg-primary/5"
                      style={{ gridTemplateColumns: "80px 1.4fr 1fr 0.9fr 0.9fr 0.8fr 0.9fr 1fr 110px 90px" }}
                    >
                      <Link to="/admin/leads/$leadId" params={{ leadId: l.id }} className="font-mono text-xs text-muted-foreground hover:text-primary">{l.id}</Link>
                      <Link to="/admin/leads/$leadId" params={{ leadId: l.id }} className="min-w-0">
                        <span className="font-semibold text-foreground">{l.company}</span>
                        <div className="text-xs text-muted-foreground">{l.industry}</div>
                      </Link>
                      <div className="text-foreground">{l.contact}</div>
                      <div className="text-muted-foreground">{l.city}</div>
                      <div className="text-muted-foreground">{leadDistricts[l.id] || "—"}</div>
                      <div className="text-muted-foreground">{l.source}</div>
                      <div>
                        <StatusBadge status={l.status} label={t(l.status as any)} />
                        {l.probability !== undefined && <div className="mt-1 text-[10px] font-semibold text-muted-foreground">{l.probability}% {t("probability")}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {l.owner.split(" ").map((w: string) => w[0]).join("")}
                        </div>
                        <span className="text-foreground">{l.owner}</span>
                      </div>
                      <div className="text-end font-mono font-semibold text-foreground">{fmtMoney(l.value)}</div>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(l)} aria-label={t("edit")} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => { if (confirm(`${t("confirmDelete")} (${l.company})`)) actions.removeLead(l.id); }} aria-label={t("delete")} className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t("noLeadsMatch")}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {editing && (
        <LeadFormModal
          initial={editing === "new" ? null : editing}
          locations={settings.locations}
          onClose={() => setEditing(null)}
        />
      )}
    </AppShell>
  );
}

function LeadFormModal({ initial, locations, onClose }: { initial: Lead | null; locations: LocationCity[]; onClose: () => void }) {
  const { t } = useI18n();
  const { leadDistricts } = useStoreState();
  const cities = locations.map((c) => c.name);
  const [company, setCompany] = useState(initial?.company ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [source, setSource] = useState(initial?.source ?? "Website");
  const [status, setStatus] = useState<LeadStatus>(initial?.status ?? "new");
  const [value, setValue] = useState(initial?.value ?? 0);
  const [city, setCity] = useState(initial?.city ?? cities[0] ?? "Cairo");
  const [district, setDistrict] = useState(initial ? (leadDistricts[initial.id] ?? "") : "");
  const [street, setStreet] = useState(initial?.street ?? "");
  const districts = locations.find((c) => c.name === city)?.districts ?? [];

  const submit = () => {
    if (!company.trim()) return;
    let leadId: string;
    if (initial) {
      actions.updateLead(initial.id, { company, contact, email, industry, source, status, value, city, street });
      leadId = initial.id;
    } else {
      actions.addLead({ company, contact, email, industry, source, status, value, city, street, owner: "hafez Rahim", lat: 30.0444, lng: 31.2357 });
      const latest = (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("int-crm:leads") || "[]") : []) as Lead[];
      leadId = latest[0]?.id ?? "";
    }
    if (leadId) actions.setLeadLocation(leadId, city, district);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{initial ? `${t("edit")} ${t("leads")}` : t("addLead")}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid max-h-[70vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
          <Field label={t("company")}><input value={company} onChange={(e) => setCompany(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></Field>
          <Field label={t("contact")}><input value={contact} onChange={(e) => setContact(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></Field>
          <Field label={t("companyEmail")}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@company.com" className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></Field>
          <Field label={t("industry")}><input value={industry} onChange={(e) => setIndustry(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></Field>
          <Field label={t("source")}>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm">
              {["Website", "Referral", "LinkedIn", "Cold Call", "Email Campaign", "Trade Show", "Social Media", "Partner"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label={t("status")}>
            <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{t(s as any)}</option>)}
            </select>
          </Field>
          <Field label={`${t("value")} (EGP)`}><input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></Field>
          <Field label={t("location")}>
            <select value={city} onChange={(e) => { setCity(e.target.value); setDistrict(""); }} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm">
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label={t("district")}>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm">
              <option value="">—</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <label className="sm:col-span-2 block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("street")}</span>
            <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. 10 Abbas El-Akkad St." className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">{t("cancel")}</button>
          <button onClick={submit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{initial ? t("save") : t("create")}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}