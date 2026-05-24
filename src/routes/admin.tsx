import { createFileRoute, Outlet, Link, Navigate, useRouterState } from "@tanstack/react-router";
import { useRole } from "@/lib/role";
import { useI18n } from "@/lib/i18n";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin } = useRole();
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Route guard: employees should never see admin detail pages.
  // Redirect /admin/leads/:id → /employee/leads/:id, and lock the rest of the
  // admin-only detail surfaces (projects/employees) behind the admin gate.
  if (!isAdmin) {
    const leadMatch = path.match(/^\/admin\/leads\/([^/]+)\/?$/);
    if (leadMatch) {
      return <Navigate to="/employee/leads/$leadId" params={{ leadId: leadMatch[1] }} replace />;
    }
  }

  // Employees can view shared modules (leads, pipeline, projects, activities)
  const employeeAllowed = [
    "/admin/leads",
    "/admin/pipeline",
    "/admin/projects",
    "/admin/activities",
  ];
  // Allow list pages, but block admin-only detail pages for employees
  // (project/employee detail surfaces stay admin-only).
  const adminOnlyDetail = /^\/admin\/(projects|employees)\/[^/]+\/?$/.test(path);
  const allowedForEmployee =
    !adminOnlyDetail &&
    employeeAllowed.some((p) => path === p || path.startsWith(p + "/"));
  if (!isAdmin && !allowedForEmployee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">{t("adminAccessRequired")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("adminAccessMsg")}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/employee" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{t("goToEmployeePanel")}</Link>
            <Link to="/" className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent">{t("switchAccount")}</Link>
          </div>
        </div>
      </div>
    );
  }
  return <Outlet />;
}