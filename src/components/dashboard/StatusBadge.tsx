const map: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  contacted: "bg-sky-50 text-sky-700 ring-sky-200",
  qualified: "bg-primary-soft text-primary ring-orange-200",
  proposal: "bg-amber-50 text-amber-700 ring-amber-200",
  negotiation: "bg-violet-50 text-violet-700 ring-violet-200",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  lost: "bg-rose-50 text-rose-700 ring-rose-200",
  present: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  late: "bg-amber-50 text-amber-700 ring-amber-200",
  absent: "bg-rose-50 text-rose-700 ring-rose-200",
  "On Track": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "At Risk": "bg-amber-50 text-amber-700 ring-amber-200",
  Delayed: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const cls = map[status] ?? "bg-secondary text-foreground ring-border";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${cls}`}>
      {label ?? status}
    </span>
  );
}