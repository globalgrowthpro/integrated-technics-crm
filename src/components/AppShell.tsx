import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Workflow,
  CalendarCheck,
  Briefcase,
  UserCircle2,
  Clock4,
  History,
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  FileBadge,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { LangToggle, useI18n } from "@/lib/i18n";
import { useState, type ReactNode } from "react";

type NavItem = { to: string; icon: typeof Users; key: any };

const adminNav: NavItem[] = [
  { to: "/admin", icon: LayoutDashboard, key: "dashboard" },
  { to: "/admin/leads", icon: Users, key: "leads" },
  { to: "/admin/pipeline", icon: Workflow, key: "pipeline" },
  { to: "/admin/activities", icon: CalendarCheck, key: "activities" },
  { to: "/admin/projects", icon: Briefcase, key: "projects" },
  { to: "/admin/offers", icon: FileBadge, key: "offers" },
  { to: "/admin/employees", icon: UserCircle2, key: "employees" },
  { to: "/admin/attendance", icon: Clock4, key: "attendance" },
  { to: "/admin/history", icon: History, key: "history" },
  { to: "/admin/settings", icon: Settings, key: "settings" },
];

const employeeNav: NavItem[] = [
  { to: "/employee", icon: LayoutDashboard, key: "dashboard" },
  { to: "/employee/leads", icon: Users, key: "myLeads" },
  { to: "/admin/pipeline", icon: Workflow, key: "pipeline" },
  { to: "/employee/activities", icon: CalendarCheck, key: "myActivities" },
  { to: "/employee/projects", icon: Briefcase, key: "myProjects" },
  { to: "/employee/offers", icon: FileBadge, key: "offers" },
  { to: "/employee/attendance", icon: Clock4, key: "attendance" },
  { to: "/employee/profile", icon: UserCircle2, key: "profile" },
];

const managerNav: NavItem[] = [
  { to: "/manager", icon: LayoutDashboard, key: "dashboard" },
  { to: "/manager/employees", icon: UserCircle2, key: "myTeam" },
  { to: "/manager/activities", icon: CalendarCheck, key: "activities" },
  { to: "/manager/offers", icon: FileBadge, key: "offers" },
  { to: "/manager/attendance", icon: Clock4, key: "attendance" },
  { to: "/manager/reports", icon: History, key: "reports" },
];

interface Props {
  panel: "admin" | "employee" | "manager";
  user: { name: string; role: string; initials: string };
  children: ReactNode;
  pageTitle: string;
}

export function AppShell({ panel, user, children, pageTitle }: Props) {
  const { t, dir } = useI18n();
  const nav = panel === "admin" ? adminNav : panel === "manager" ? managerNav : employeeNav;
  const router = useRouterState();
  const pathname = router.location.pathname;
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background" dir={dir}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-30 w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-transform md:relative md:flex ${
          open ? "flex translate-x-0" : "hidden md:flex"
        } ${dir === "rtl" ? "right-0" : "left-0"}`}
        style={{ backgroundImage: "var(--gradient-sidebar)" }}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
            <img src={logo} alt="INT-CRM" className="h-8 w-8 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-extrabold tracking-tight">INT-CRM</div>
            <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/60">
              {panel === "admin" ? t("adminPanel") : panel === "manager" ? t("managerPanel") : t("employeePanel")}
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const active =
              pathname === item.to ||
              (item.to !== `/${panel}` && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-brand)]"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("logout")}</span>
          </Link>
          <div className="mt-3 text-[10px] leading-snug text-sidebar-foreground/40">
            {t("developedBy")}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <button
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-base font-bold text-foreground md:text-lg">
              {pageTitle}
            </h1>
            <p className="hidden text-xs text-muted-foreground md:block">{t("tagline")}</p>
          </div>

          <div className="relative ms-auto hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" style={{ insetInlineStart: "0.75rem" }} />
            <input
              placeholder={t("search")}
              className="h-10 w-full rounded-lg border border-border bg-secondary/60 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ paddingInlineStart: "2.25rem", paddingInlineEnd: "0.75rem" }}
            />
          </div>

          <LangToggle />

          <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 h-2 w-2 rounded-full bg-primary" style={{ insetInlineEnd: "0.375rem" }} />
          </button>

          <div className="flex items-center gap-3 rounded-md border border-border bg-card px-2.5 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user.initials}
            </div>
            <div className="hidden text-xs leading-tight sm:block">
              <div className="font-semibold text-foreground">{user.name}</div>
              <div className="text-muted-foreground">{user.role}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}