import { createFileRoute, Outlet, Link, Navigate, useRouterState } from "@tanstack/react-router";
import { useRole } from "@/lib/role";
import { useI18n } from "@/lib/i18n";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, role } = useRole();
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Redirect /admin/leads/:id to the correct panel based on active role
  if (!isAdmin) {
    const leadMatch = path.match(/^\/admin\/leads\/([^/]+)\/?$/);
    if (leadMatch) {
      const dest = role === "manager" ? "/employee/leads/$leadId" : "/employee/leads/$leadId";
      return <Navigate to={dest} params={{ leadId: leadMatch[1] }} replace />;
    }
  }

  // Non-admin roles (manager & employee) can view shared modules
  const sharedAllowed = [
    "/admin/leads",
    "/admin/pipeline",
    "/admin/projects",
    "/admin/activities",
  ];
  // Block admin-only detail pages (project/employee detail surfaces stay admin-only)
  const adminOnlyDetail = /^\/admin\/(projects|employees)\/[^/]+\/?$/.test(path);
  const allowedForNonAdmin =
    !adminOnlyDetail &&
    sharedAllowed.some((p) => path === p || path.startsWith(p + "/"));

  if (!isAdmin && !allowedForNonAdmin) {
    const homeLink = role === "manager" ? "/manager" : "/employee";
    const homeLinkLabel = role === "manager" ? t("managerPanel") : t("goToEmployeePanel");
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
            <Link to={homeLink} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{homeLinkLabel}</Link>
            <Link to="/" className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent">{t("switchAccount")}</Link>
          </div>
        </div>
      </div>
    );
  }
  return <Outlet />;
}