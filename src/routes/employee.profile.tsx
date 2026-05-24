import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { actions, useStoreState } from "@/lib/store";
import { useState } from "react";
import { Mail, Phone, Award, Briefcase, Pencil, X, Plus } from "lucide-react";

export const Route = createFileRoute("/employee/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useI18n();
  const { profile } = useStoreState();
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const initials = profile.name.split(" ").map((s) => s[0]).join("").slice(0, 2);

  return (
    <AppShell panel="employee" user={{ name: profile.name, role: t("employee"), initials }} pageTitle={t("profile")}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-primary-foreground shadow-[var(--shadow-brand)]" style={{ background: "var(--gradient-brand)" }}>
            {initials}
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">{profile.title} · {profile.department}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Award className="h-3.5 w-3.5" /> Top Performer · Q4 2025
          </div>
          <div className="mt-6 space-y-2 text-start text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4 shrink-0" /> <span className="truncate">{profile.email}</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 shrink-0" /> {profile.phone}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4 shrink-0" /> {profile.location}</div>
          </div>
          <button onClick={() => setEditing(true)} className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent">
            <Pencil className="h-3.5 w-3.5" /> {t("editProfile")}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-display text-base font-bold text-foreground">{t("kpis")}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { l: "Leads", v: "38" },
                { l: "Won", v: "14" },
                { l: "Conversion", v: "36.8%" },
                { l: "Score", v: "96" },
              ].map((k) => (
                <div key={k.l} className="rounded-xl bg-secondary/50 p-4 text-center">
                  <div className="font-display text-2xl font-bold text-foreground">{k.v}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-display text-base font-bold text-foreground">{t("skillsAndCertifications")}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {s}
                  <button onClick={() => actions.updateProfile({ skills: profile.skills.filter((x) => x !== s) })} className="opacity-60 hover:opacity-100" aria-label={`Remove ${s}`}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder={t("addSkill")} className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm" />
              <button onClick={() => { if (newSkill.trim()) { actions.updateProfile({ skills: [...profile.skills, newSkill.trim()] }); setNewSkill(""); } }} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" /> {t("add")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {editing && <ProfileEditModal onClose={() => setEditing(false)} />}
    </AppShell>
  );
}

function ProfileEditModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { profile } = useStoreState();
  const [form, setForm] = useState(profile);
  const submit = () => { actions.updateProfile(form); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">{t("editProfile")}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {([
            ["name", t("fullName")],
            ["title", t("title")],
            ["department", t("department")],
            ["email", t("email")],
            ["phone", t("phone")],
            ["location", t("location")],
          ] as [string, string][]).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
              <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" />
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">{t("cancel")}</button>
          <button onClick={submit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{t("save")}</button>
        </div>
      </div>
    </div>
  );
}