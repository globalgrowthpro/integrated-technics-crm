import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useI18n, LangToggle } from "@/lib/i18n";
import { setStoredRole } from "@/lib/role";
import logo from "@/assets/logo.png";
import { ShieldCheck, UserCog, BarChart3, ArrowRight, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t, dir } = useI18n();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background" dir={dir}>
      {/* Decorative gradient panel */}
      <div className="absolute inset-y-0 hidden w-1/2 lg:block" style={{ insetInlineStart: 0 }}>
        <div className="relative h-full w-full" style={{ background: "var(--gradient-sidebar)" }}>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, oklch(0.706 0.181 49.5 / 0.6), transparent 40%), radial-gradient(circle at 80% 80%, oklch(0.706 0.181 49.5 / 0.3), transparent 50%)",
            }}
          />
          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
                <img src={logo} alt="Integrated Technics" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold tracking-tight">INT-CRM</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Integrated Technics
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
                {dir === "rtl"
                  ? "منصة العمليات والعلاقات الذكية للمؤسسات."
                  : "The operational intelligence layer for your enterprise."}
              </h2>
              <p className="max-w-md text-base text-white/70">
                {dir === "rtl"
                  ? "إدارة العملاء، الفرص، المشاريع، الموظفين والحضور — في منصة واحدة موحّدة متكاملة مع Odoo 19."
                  : "Unify leads, pipelines, projects, employees and attendance — fully integrated with Odoo 19."}
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { n: "1.2k+", l: dir === "rtl" ? "عميل" : "Leads" },
                  { n: "47", l: dir === "rtl" ? "مشروع نشط" : "Active Projects" },
                  { n: "153", l: dir === "rtl" ? "موظف" : "Employees" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
                    <div className="font-display text-2xl font-bold text-primary">{s.n}</div>
                    <div className="text-[11px] uppercase tracking-wider text-white/60">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-white/40">
              {t("developedBy")} · {t("poweredBy")}
            </div>
          </div>
        </div>
      </div>

      {/* Login card */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12 lg:ms-[50%] lg:w-1/2">
        <div className="absolute top-6 flex items-center gap-3" style={{ insetInlineEnd: "1.5rem" }}>
          <LangToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow ring-1 ring-border">
              <img src={logo} alt="INT-CRM" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <div className="font-display text-xl font-extrabold">INT-CRM</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Integrated Technics
              </div>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {t("welcome")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("signInSub")}</p>

          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("email")}
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" style={{ insetInlineStart: "0.875rem" }} />
                <input
                  type="email"
                  defaultValue="hafez.rahim@integratedtechnics.com"
                  className="h-11 w-full rounded-lg border border-border bg-card text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ paddingInlineStart: "2.5rem", paddingInlineEnd: "0.875rem" }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("password")}
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" style={{ insetInlineStart: "0.875rem" }} />
                <input
                  type="password"
                  defaultValue="••••••••••"
                  className="h-11 w-full rounded-lg border border-border bg-card text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ paddingInlineStart: "2.5rem", paddingInlineEnd: "0.875rem" }}
                />
              </div>
            </div>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("continueAs")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              to="/admin"
              onClick={() => setStoredRole("admin")}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-start transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-brand)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-foreground">
                  {t("adminPanel")}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {dir === "rtl" ? "إدارة كاملة وتحليلات" : "Full control & analytics"}
                </div>
              </div>
              <ArrowRight className="ms-auto h-4 w-4 text-primary transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
            <Link
              to="/manager"
              onClick={() => setStoredRole("manager")}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-start transition-all hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-[0_0_0_2px_theme(colors.orange.200)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-foreground">
                  {t("managerPanel")}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {dir === "rtl" ? "إشراف الفريق والتقارير" : "Team oversight & reports"}
                </div>
              </div>
              <ArrowRight className="ms-auto h-4 w-4 text-orange-500 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
            <Link
              to="/employee"
              onClick={() => setStoredRole("employee")}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-start transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-brand)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground ring-1 ring-border">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-foreground">
                  {t("employeePanel")}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {dir === "rtl" ? "مهامي وأدائي اليومي" : "My tasks & performance"}
                </div>
              </div>
              <ArrowRight className="ms-auto h-4 w-4 text-foreground transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>

          <p className="mt-10 text-center text-[11px] text-muted-foreground">
            © 2026 Integrated Technics · INT-CRM v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
