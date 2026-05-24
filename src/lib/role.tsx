import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "employee" | "manager";

const KEY = "int-crm:role";

export function getStoredRole(): Role {
  if (typeof window === "undefined") return "admin";
  return (localStorage.getItem(KEY) as Role) ?? "admin";
}

export function setStoredRole(r: Role) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, r);
  window.dispatchEvent(new CustomEvent("int-crm:role-change", { detail: r }));
}

interface Ctx { role: Role; setRole: (r: Role) => void; isAdmin: boolean; isManager: boolean; }
const RoleCtx = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("admin");
  useEffect(() => {
    setRoleState(getStoredRole());
    const onChange = (e: Event) => setRoleState(((e as CustomEvent).detail as Role) ?? getStoredRole());
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setRoleState(getStoredRole()); };
    window.addEventListener("int-crm:role-change", onChange as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("int-crm:role-change", onChange as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const setRole = (r: Role) => { setStoredRole(r); setRoleState(r); };
  return <RoleCtx.Provider value={{ role, setRole, isAdmin: role === "admin", isManager: role === "manager" }}>{children}</RoleCtx.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleCtx);
  if (!ctx) throw new Error("useRole must be inside RoleProvider");
  return ctx;
}