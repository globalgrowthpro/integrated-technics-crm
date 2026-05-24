import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { fmtMoney } from "@/lib/mock-data";
import { actions, useStoreState, type LeadStatus } from "@/lib/store";
import { useRole } from "@/lib/role";
import { GripVertical, ExternalLink } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/pipeline")({
  component: PipelinePage,
  head: () => ({ meta: [{ title: "Pipeline · INT-CRM" }] }),
});

function PipelinePage() {
  const { t } = useI18n();
  const { leads, settings } = useStoreState();
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const panel = isAdmin ? "admin" : "employee";
  const user = { name: "hafez Rahim", role: isAdmin ? t("admin") : t("employee"), initials: "HR" };
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStatus | null>(null);

  const stages = settings.stages.filter((s) => s.key !== "lost");

  return (
    <AppShell panel={panel} user={user} pageTitle={t("pipeline")}>
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <GripVertical className="h-3.5 w-3.5" />
        {t("dragCardHint")}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          const totalValue = stageLeads.reduce((sum, l) => sum + l.value, 0);
          const isOver = overStage === stage.key;
          return (
            <div
              key={stage.key}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage.key as LeadStatus); }}
              onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                const lid = e.dataTransfer.getData("text/lead-id") || dragId;
                if (lid) actions.moveLead(lid, stage.key as LeadStatus);
                setDragId(null);
                setOverStage(null);
              }}
              className={`rounded-xl p-3 transition ${isOver ? "bg-primary/10 ring-2 ring-primary" : "bg-secondary/40"}`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">{t(stage.key as any) ?? stage.label}</span>
                  <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground ring-1 ring-border">
                    {stageLeads.length}
                  </span>
                </div>
              </div>
              <div className="mb-2 px-1 font-mono text-[10px] text-muted-foreground">{fmtMoney(totalValue)}</div>
              <div className="min-h-[80px] space-y-2">
                {stageLeads.map((l) => (
                  <div
                    key={l.id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(l.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/lead-id", l.id);
                    }}
                    onDragEnd={() => { setDragId(null); setOverStage(null); }}
                    onClick={() => navigate({ to: "/admin/leads/$leadId", params: { leadId: l.id } })}
                    className={`group cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition active:cursor-grabbing ${dragId === l.id ? "opacity-50 border-primary" : "border-border hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">{l.company}</div>
                        <div className="truncate text-xs text-muted-foreground">{l.contact}</div>
                      </div>
                      <Link
                        to="/admin/leads/$leadId"
                        params={{ leadId: l.id }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-primary"
                        aria-label={t("openLead")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">{fmtMoney(l.value)}</span>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                        {l.owner.split(" ").map((w: string) => w[0]).join("")}
                      </div>
                    </div>
                    {l.probability !== undefined && (
                      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <div className={`h-1.5 w-1.5 rounded-full ${l.probability >= 70 ? "bg-emerald-500" : l.probability >= 40 ? "bg-amber-500" : "bg-rose-500"}`} />
                          {l.probability}% {t("probability")}
                        </span>
                        {l.expectedCloseDate && <span className="font-mono">{l.expectedCloseDate}</span>}
                      </div>
                    )}
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border py-6 text-center text-[11px] text-muted-foreground">
                    {t("dropLeadsHere")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}