import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { fmtMoney, type Lead, type LeadStatus } from "@/lib/mock-data";
import { actions, useStoreState } from "@/lib/store";
import type { LocationCity } from "@/lib/store";
import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/employee/leads")({
  component: LeadsPage,
});

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];

function LeadsPage() {
  const { t } = useI18n();
  const { leads, settings } = useStoreState();
  const isDetailRoute = useRouterState({
    select: (state) => state.location.pathname.startsWith("/employee/leads/") && state.location.pathname !== "/employee/leads/",
  });
  const [editing, setEditing] = useState<Lead | "new" | null>(null);

  if (isDetailRoute) return <Outlet />;

  return (
    <AppShell panel="employee" user={{ name: "hafez Rahim", role: t("employee"), initials: "HR" }} pageTitle={t("myLeads")}>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] hover:bg-primary/90">
          <Plus className="h-4 w-4" /> {t("addLead")}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {leads.map((l) => (
          <div key={l.id} className="group relative rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition hover:border-primary hover:shadow-md">
            <Link to="/employee/leads/$leadId" params={{ leadId: l.id }} className="block">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-display text-base font-bold text-foreground">{l.company}</div>
                  <div className="truncate text-xs text-muted-foreground">{l.contact} · {l.industry}</div>
                </div>
                <StatusBadge status={l.status} label={t(l.status as any)} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="truncate text-xs text-muted-foreground">{l.source} · {l.city}</span>
                <span className="font-mono text-sm font-bold text-primary">{fmtMoney(l.value)}</span>
              </div>
              {l.probability !== undefined && (
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <div className={`h-1.5 w-1.5 rounded-full ${l.probability >= 70 ? "bg-emerald-500" : l.probability >= 40 ? "bg-amber-500" : "bg-rose-500"}`} />
                    {l.probability}% {t("probability")}
                  </span>
                  {l.expectedCloseDate && <span className="font-mono">{l.expectedCloseDate}</span>}
                </div>
              )}
            </Link>
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <button onClick={() => setEditing(l)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary px-2 py-1.5 text-xs font-semibold hover:bg-accent">
                <Pencil className="h-3 w-3" /> {t("edit")}
              </button>
              <button onClick={() => { if (confirm(`${t("confirmDelete")} (${l.company})`)) actions.removeLead(l.id); }} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100">
                <Trash2 className="h-3 w-3" /> {t("delete")}
              </button>
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">{t("noLeadsYet")}</div>
        )}
      </div>

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
      // newest lead is at index 0
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
          <Field label={t("source")}><input value={source} onChange={(e) => setSource(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" /></Field>
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
              <option value="">{t("selectDistrict")}</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <label className="sm:col-span-2 block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("streetName")}</span>
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