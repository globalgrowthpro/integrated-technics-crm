import { useSyncExternalStore } from "react";
import { leads, activities, projects, attendanceToday, employees, quotations } from "./mock-data";
import type { Lead, LeadStatus, Quotation } from "./mock-data";

export type HistoryModule = "lead" | "pipeline" | "project" | "employee" | "activity" | "settings";
export interface HistoryEntry {
  id: string;
  ts: string; // ISO
  module: HistoryModule;
  action: string;
  actor: string;
  target: string;
  details?: string;
}

export type ActivityType = "Call" | "Meeting" | "Site Visit" | "Follow-up" | "Inspection" | "Email";
export type ActivityStatus = "pending" | "in_progress" | "done" | "cancelled";
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  leadId?: string;
  projectId?: string;
  dueDate: string; // YYYY-MM-DD
  time: string; // HH:mm
  owner: string;
  status: ActivityStatus;
  notes?: string;
  estMinutes?: number; // estimated time spent on this action
  createdAt: string;
  presalesTeam?: string[];
}

export interface Note {
  id: string;
  leadId: string;
  ts: string;
  author: string;
  text: string;
}

export interface Attachment {
  id: string;
  leadId: string;
  name: string;
  size: string;
  ts: string;
  dataUrl?: string;
  mime?: string;
}

export interface PipelineStageDef {
  key: string;
  label: string;
  color: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: "Email" | "SMS" | "WhatsApp" | "Push";
  subject: string;
  body: string;
}

export interface LocationCity {
  name: string;
  districts: string[];
}

export type UserRoleKey = "admin" | "manager" | "hr" | "finance" | "employee";
export const USER_ROLES: UserRoleKey[] = ["admin", "manager", "hr", "finance", "employee"];
export const APP_PAGES = [
  "dashboard",
  "leads",
  "pipeline",
  "activities",
  "projects",
  "employees",
  "attendance",
  "offers",
  "history",
  "settings",
] as const;
export type AppPage = (typeof APP_PAGES)[number];
export type CrudOp = "create" | "read" | "update" | "delete";
export interface RolePermission {
  pages: AppPage[];
  crud: Record<AppPage, CrudOp[]>;
}
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleKey;
  active: boolean;
}

export interface ProjectLocation {
  city: string;
  district: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  budget: number;
  status: string;
  team: number;
  offeredValue: number;
  category: string;
  competitors: string[];
  lastUpdate: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:mm
  checkOut: string; // HH:mm or ""
  hours: string; // computed label
  location: string;
  owner: string;
}

export interface Profile {
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  manager?: string;
  avatarUrl?: string;
  targetValue?: number;
  targetType?: "yearly" | "quarterly" | "monthly";
}


interface Settings {
  statuses: string[];
  stages: PipelineStageDef[];
  activityTypes: ActivityType[];
  automations: AutomationRule[];
  templates: NotificationTemplate[];
  locations: LocationCity[];
  permissions: Record<UserRoleKey, RolePermission>;
}

interface State {
  leads: any[];
  history: HistoryEntry[];
  activities: Activity[];
  notes: Note[];
  attachments: Attachment[];
  settings: Settings;
  leadDistricts: Record<string, string>;
  projectLocations: Record<string, ProjectLocation>;
  projects: typeof projects;
  quotations: typeof quotations;
  attendance: AttendanceRecord[];
  profile: Profile;
  users: AppUser[];
}

const now = () => new Date().toISOString();
const id = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const today = new Date();
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return ymd(d); };

const seedHistory: HistoryEntry[] = [
  { id: "H-001", ts: new Date(Date.now() - 1000 * 60 * 12).toISOString(), module: "pipeline", actor: "hafez Rahim", target: "Aramco Digital", action: "Moved to Negotiation", details: "From Proposal → Negotiation" },
  { id: "H-002", ts: new Date(Date.now() - 1000 * 60 * 45).toISOString(), module: "lead", actor: "Nour Khaled", target: "Red Sea Global", action: "Created proposal", details: "Value SAR 280K" },
  { id: "H-003", ts: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), module: "activity", actor: "Omar Tarek", target: "STC Group", action: "Logged call", details: "Discovery call — 35 min" },
  { id: "H-004", ts: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), module: "project", actor: "Aisha Mahmoud", target: "P-206 STC DC4", action: "Status changed to At Risk" },
  { id: "H-005", ts: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), module: "employee", actor: "Yusuf Saleh", target: "Layla Hassan", action: "Updated role", details: "Field Operations → Senior Field Ops" },
  { id: "H-006", ts: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), module: "settings", actor: "hafez Rahim", target: "Pipeline", action: "Renamed stage", details: "‘Won’ retained" },
  { id: "H-007", ts: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), module: "lead", actor: "Layla Hassan", target: "NEOM Logistics", action: "Lead created", details: "Source: Event" },
];

function allCrud(): CrudOp[] { return ["create", "read", "update", "delete"]; }
function defaultPermissions(): Record<UserRoleKey, RolePermission> {
  const allPages = [...APP_PAGES] as AppPage[];
  const mk = (pages: AppPage[], crudByPage: Partial<Record<AppPage, CrudOp[]>>, defaultCrud: CrudOp[] = ["read"]): RolePermission => ({
    pages,
    crud: Object.fromEntries(allPages.map((p) => [p, pages.includes(p) ? (crudByPage[p] ?? defaultCrud) : []])) as Record<AppPage, CrudOp[]>,
  });
  return {
    admin: mk(allPages, Object.fromEntries(allPages.map((p) => [p, allCrud()])), allCrud()),
    manager: mk(
      ["dashboard", "leads", "pipeline", "activities", "projects", "employees", "attendance", "offers", "history"],
      { leads: allCrud(), pipeline: allCrud(), activities: allCrud(), projects: ["read", "update"], attendance: ["read", "update"], offers: ["read", "update"] },
    ),
    hr: mk(["dashboard", "employees", "attendance", "history"], { employees: allCrud(), attendance: allCrud() }),
    finance: mk(["dashboard", "offers", "projects", "history"], { offers: allCrud(), projects: ["read", "update"] }),
    employee: mk(["dashboard", "leads", "activities", "attendance"], { leads: ["create", "read", "update"], activities: ["create", "read", "update"], attendance: ["create", "read"] }),
  };
}

const seedUsers: AppUser[] = [
  { id: "U-1", name: "hafez Rahim", email: "hafez.rahim@integratedtechnics.com", role: "admin", active: true },
  { id: "U-2", name: "Nour Khaled", email: "nour.khaled@integratedtechnics.com", role: "manager", active: true },
  { id: "U-3", name: "Layla Hassan", email: "layla.hassan@integratedtechnics.com", role: "hr", active: true },
  { id: "U-4", name: "Yusuf Saleh", email: "yusuf.saleh@integratedtechnics.com", role: "finance", active: true },
  { id: "U-5", name: "Omar Tarek", email: "omar.tarek@integratedtechnics.com", role: "employee", active: true },
];

const seedNotes: Note[] = [
  { id: "N-1", leadId: "L-1042", ts: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), author: "hafez Rahim", text: "Client requested a revised SLA with 4-hour response window." },
  { id: "N-2", leadId: "L-1042", ts: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), author: "Nour Khaled", text: "Site survey scheduled for next Tuesday with their facilities team." },
];

const seedAttachments: Attachment[] = [
  { id: "F-1", leadId: "L-1042", name: "Aramco_RFP_v2.pdf", size: "2.4 MB", ts: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
  { id: "F-2", leadId: "L-1042", name: "Site_Survey_Photos.zip", size: "18.1 MB", ts: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
];

const seedProfile: Profile = {
  name: "hafez Rahim",
  title: "Sales Director",
  department: "Sales Department",
  email: "hafez.rahim@integratedtechnics.com",
  phone: "+20 100 123 4567",
  location: "Cairo HQ, Egypt",
  skills: ["Enterprise Sales", "CRM Strategy", "Odoo 19", "Negotiation", "Pipeline Management", "PMP Certified", "ITIL v4", "GDPR Compliance"],
  manager: "Nour Khaled",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  targetValue: 1200000,
  targetType: "yearly",
};


const seedSettings: Settings = {
  statuses: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"],
  stages: [
    { key: "new", label: "New", color: "#64748b" },
    { key: "contacted", label: "Contacted", color: "#3b82f6" },
    { key: "qualified", label: "Qualified", color: "#8b5cf6" },
    { key: "proposal", label: "Proposal", color: "#f59e0b" },
    { key: "negotiation", label: "Negotiation", color: "#ec4899" },
    { key: "won", label: "Won", color: "#10b981" },
    { key: "lost", label: "Lost", color: "#ef4444" },
  ],
  activityTypes: ["Call", "Meeting", "Site Visit", "Follow-up", "Inspection", "Email"],
  automations: [
    { id: "AU-1", name: "Auto-assign new web leads", trigger: "Lead created from Website", action: "Assign to Nour Khaled", enabled: true },
    { id: "AU-2", name: "Notify owner on stage change", trigger: "Pipeline stage moved", action: "Send push notification", enabled: true },
    { id: "AU-3", name: "Escalate stalled proposals", trigger: "Lead in Proposal > 7 days", action: "Notify sales director", enabled: false },
    { id: "AU-4", name: "Create kickoff project on Won", trigger: "Lead marked as Won", action: "Auto-create Project draft", enabled: true },
  ],
  templates: [
    { id: "T-1", name: "Welcome email", channel: "Email", subject: "Welcome to Integrated Technics", body: "Dear {{contact}}, thank you for your interest in our services..." },
    { id: "T-2", name: "Proposal reminder", channel: "Email", subject: "Following up on your proposal — {{company}}", body: "Hi {{contact}}, just checking if you had a chance to review our proposal..." },
    { id: "T-3", name: "Site visit confirmation", channel: "SMS", subject: "", body: "Hello {{contact}}, our engineer will arrive at {{time}} on {{date}}. — INT" },
    { id: "T-4", name: "Won deal notification", channel: "WhatsApp", subject: "", body: "🎉 Welcome aboard {{company}}! Your project kickoff is being prepared." },
  ],
  locations: [
    { name: "Cairo", districts: ["Nasr City", "Maadi", "Heliopolis", "Zamalek", "Downtown", "New Cairo"] },
    { name: "Giza", districts: ["Dokki", "Mohandessin", "6th of October", "Sheikh Zayed", "Haram"] },
    { name: "Alexandria", districts: ["Smouha", "Sidi Gaber", "Stanley", "Miami", "Montaza"] },
    { name: "Hurghada", districts: ["Sakkala", "Sahl Hasheesh", "El Dahar"] },
    { name: "Luxor", districts: ["East Bank", "West Bank", "Karnak"] },
    { name: "Port Said", districts: ["Al Arab", "Al Manakh", "Port Fouad"] },
  ],
  permissions: defaultPermissions(),
};

const seedAttendance: AttendanceRecord[] = attendanceToday.records.map((r) => ({
  id: `AT-${r.id}`,
  date: new Date().toISOString().slice(0, 10),
  checkIn: r.in === "—" ? "" : r.in,
  checkOut: r.out === "—" ? "" : r.out,
  hours: r.hours,
  location: r.location === "—" ? "Cairo HQ" : r.location,
  owner: r.name,
}));

const seedActivities: Activity[] = activities.map((a) => ({
  ...a,
  id: String(a.id),
  type: a.type as ActivityType,
  status: a.status as ActivityStatus,
  dueDate: new Date().toISOString().slice(0, 10),
  createdAt: new Date().toISOString(),
}));

let state: State = {
  leads: loadPersisted<Lead[]>("int-crm:leads", leads.map((l) => ({ ...l }))),
  history: seedHistory,
  activities: loadPersisted<Activity[]>("int-crm:activities", seedActivities),
  notes: loadPersisted<Note[]>("int-crm:notes", seedNotes),
  attachments: loadPersisted<Attachment[]>("int-crm:attachments", seedAttachments),
  settings: {
    ...seedSettings,
    locations: loadPersisted<LocationCity[]>("int-crm:locations", seedSettings.locations),
    permissions: loadPersisted<Record<UserRoleKey, RolePermission>>("int-crm:permissions", seedSettings.permissions),
  },
  leadDistricts: loadPersisted<Record<string, string>>("int-crm:leadDistricts", {}),
  projectLocations: loadPersisted<Record<string, ProjectLocation>>("int-crm:projectLocations", {}),
  projects: loadPersisted<Project[]>("int-crm:projects", projects.map((p) => ({ ...p }))),
  quotations: loadPersisted<Quotation[]>("int-crm:quotations", quotations),
  attendance: loadPersisted<AttendanceRecord[]>("int-crm:attendance", seedAttendance),
  profile: loadPersisted<Profile>("int-crm:profile", seedProfile),
  users: loadPersisted<AppUser[]>("int-crm:users", seedUsers),
};

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const emit = () => { listeners.forEach((l) => l()); };
const getSnap = () => state;

function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
  emit();
}

function loadPersisted<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("int-crm:leads", JSON.stringify(state.leads));
    localStorage.setItem("int-crm:activities", JSON.stringify(state.activities));
    localStorage.setItem("int-crm:notes", JSON.stringify(state.notes));
    localStorage.setItem("int-crm:attachments", JSON.stringify(state.attachments));
    localStorage.setItem("int-crm:locations", JSON.stringify(state.settings.locations));
    localStorage.setItem("int-crm:leadDistricts", JSON.stringify(state.leadDistricts));
    localStorage.setItem("int-crm:projectLocations", JSON.stringify(state.projectLocations));
    localStorage.setItem("int-crm:projects", JSON.stringify(state.projects));
    localStorage.setItem("int-crm:quotations", JSON.stringify(state.quotations));
    localStorage.setItem("int-crm:attendance", JSON.stringify(state.attendance));
    localStorage.setItem("int-crm:profile", JSON.stringify(state.profile));
    localStorage.setItem("int-crm:users", JSON.stringify(state.users));
    localStorage.setItem("int-crm:permissions", JSON.stringify(state.settings.permissions));
  } catch { /* quota or serialization issue — ignore */ }
}

export function useStoreState(): State {
  return useSyncExternalStore(subscribe, getSnap, getSnap);
}

function logHistory(entry: Omit<HistoryEntry, "id" | "ts">) {
  set((s) => ({ ...s, history: [{ id: id("H"), ts: now(), ...entry }, ...s.history] }));
}

export const actions = {
  moveLead(leadId: string, to: LeadStatus, actor = "hafez Rahim") {
    let from: LeadStatus | undefined;
    let company = "";
    set((s) => ({
      ...s,
      leads: s.leads.map((l) => {
        if (l.id === leadId) {
          from = l.status;
          company = l.company;
          return { ...l, status: to, updatedAt: "just now" };
        }
        return l;
      }),
    }));
    if (from && from !== to) {
      const label = (k: LeadStatus) => state.settings.stages.find((x) => x.key === k)?.label ?? k;
      logHistory({ module: "pipeline", actor, target: company || leadId, action: `Moved to ${label(to)}`, details: `${label(from)} → ${label(to)}` });
    }
  },
  addNote(leadId: string, text: string, author = "hafez Rahim") {
    const note: Note = { id: id("N"), leadId, ts: now(), author, text };
    set((s) => ({ ...s, notes: [note, ...s.notes] }));
    const company = state.leads.find((l) => l.id === leadId)?.company ?? leadId;
    logHistory({ module: "lead", actor: author, target: company, action: "Added note", details: text.slice(0, 80) });
  },
  addAttachment(leadId: string, name: string, size = "—", author = "hafez Rahim", dataUrl?: string, mime?: string) {
    const att: Attachment = { id: id("F"), leadId, name, size, ts: now(), dataUrl, mime };
    set((s) => ({ ...s, attachments: [att, ...s.attachments] }));
    const company = state.leads.find((l) => l.id === leadId)?.company ?? leadId;
    logHistory({ module: "lead", actor: author, target: company, action: "Uploaded attachment", details: name });
  },
  removeAttachment(attId: string, actor = "hafez Rahim") {
    const att = state.attachments.find((a) => a.id === attId);
    set((s) => ({ ...s, attachments: s.attachments.filter((a) => a.id !== attId) }));
    if (att) {
      const company = state.leads.find((l) => l.id === att.leadId)?.company ?? att.leadId;
      logHistory({ module: "lead", actor, target: company, action: "Removed attachment", details: att.name });
    }
  },
  removeNote(noteId: string, actor = "hafez Rahim") {
    const note = state.notes.find((n) => n.id === noteId);
    set((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== noteId) }));
    if (note) {
      const company = state.leads.find((l) => l.id === note.leadId)?.company ?? note.leadId;
      logHistory({ module: "lead", actor, target: company, action: "Removed note" });
    }
  },
  sendReminder(activityId: string, templateId: string, actor = "hafez Rahim") {
    const activity = state.activities.find((a) => a.id === activityId);
    const template = state.settings.templates.find((t) => t.id === templateId);
    if (!activity || !template) return;
    const lead = activity.leadId ? state.leads.find((l) => l.id === activity.leadId) : undefined;
    const target = lead?.company ?? activity.projectId ?? activity.title;
    logHistory({
      module: "activity",
      actor,
      target,
      action: `Sent ${template.channel} reminder`,
      details: `“${template.name}” → ${activity.title}`,
    });
  },
  addActivity(a: Omit<Activity, "id" | "createdAt" | "status"> & { status?: ActivityStatus }) {
    const act: Activity = { id: id("A"), createdAt: now(), status: a.status ?? "pending", ...a };
    set((s) => ({ ...s, activities: [act, ...s.activities] }));
    const target = act.leadId ? state.leads.find((l) => l.id === act.leadId)?.company ?? act.leadId : act.projectId ?? "—";
    logHistory({ module: "activity", actor: act.owner, target, action: `Scheduled ${act.type}`, details: `${act.title} @ ${act.dueDate} ${act.time}` });
  },
  setActivityStatus(actId: string, status: ActivityStatus, actor = "hafez Rahim") {
    let title = "";
    set((s) => ({
      ...s,
      activities: s.activities.map((a) => {
        if (a.id === actId) { title = a.title; return { ...a, status }; }
        return a;
      }),
    }));
    logHistory({ module: "activity", actor, target: title, action: `Marked ${status.replace("_", " ")}` });
  },
  toggleAutomation(ruleId: string) {
    let name = "", enabled = false;
    set((s) => ({
      ...s,
      settings: {
        ...s.settings,
        automations: s.settings.automations.map((r) => {
          if (r.id === ruleId) { name = r.name; enabled = !r.enabled; return { ...r, enabled }; }
          return r;
        }),
      },
    }));
    logHistory({ module: "settings", actor: "hafez Rahim", target: name, action: enabled ? "Enabled automation" : "Disabled automation" });
  },
  renameStage(key: string, label: string) {
    set((s) => ({ ...s, settings: { ...s.settings, stages: s.settings.stages.map((st) => st.key === key ? { ...st, label } : st) } }));
    logHistory({ module: "settings", actor: "hafez Rahim", target: "Pipeline", action: "Renamed stage", details: `${key} → ${label}` });
  },
  addActivityType(t: string) {
    set((s) => ({ ...s, settings: { ...s.settings, activityTypes: [...s.settings.activityTypes, t as ActivityType] } }));
    logHistory({ module: "settings", actor: "hafez Rahim", target: "Activities", action: "Added activity type", details: t });
  },
  addCity(name: string) {
    const n = name.trim();
    if (!n) return;
    if (state.settings.locations.some((c) => c.name.toLowerCase() === n.toLowerCase())) return;
    set((s) => ({ ...s, settings: { ...s.settings, locations: [...s.settings.locations, { name: n, districts: [] }] } }));
    logHistory({ module: "settings", actor: "hafez Rahim", target: "Locations", action: "Added city", details: n });
  },
  removeCity(name: string) {
    set((s) => ({ ...s, settings: { ...s.settings, locations: s.settings.locations.filter((c) => c.name !== name) } }));
    logHistory({ module: "settings", actor: "hafez Rahim", target: "Locations", action: "Removed city", details: name });
  },
  addDistrict(city: string, district: string) {
    const d = district.trim();
    if (!d) return;
    set((s) => ({
      ...s,
      settings: {
        ...s.settings,
        locations: s.settings.locations.map((c) =>
          c.name === city && !c.districts.some((x) => x.toLowerCase() === d.toLowerCase())
            ? { ...c, districts: [...c.districts, d] }
            : c,
        ),
      },
    }));
    logHistory({ module: "settings", actor: "hafez Rahim", target: city, action: "Added district", details: d });
  },
  removeDistrict(city: string, district: string) {
    set((s) => ({
      ...s,
      settings: {
        ...s.settings,
        locations: s.settings.locations.map((c) =>
          c.name === city ? { ...c, districts: c.districts.filter((x) => x !== district) } : c,
        ),
      },
    }));
    logHistory({ module: "settings", actor: "hafez Rahim", target: city, action: "Removed district", details: district });
  },
  setLeadLocation(leadId: string, city: string, district: string) {
    let company = leadId;
    set((s) => ({
      ...s,
      leads: s.leads.map((l) => {
        if (l.id === leadId) { company = l.company; return { ...l, city }; }
        return l;
      }),
      leadDistricts: { ...s.leadDistricts, [leadId]: district },
    }));
    logHistory({ module: "lead", actor: "hafez Rahim", target: company, action: "Updated location", details: `${city}${district ? ` · ${district}` : ""}` });
  },
  setProjectLocation(projectId: string, city: string, district: string) {
    set((s) => ({ ...s, projectLocations: { ...s.projectLocations, [projectId]: { city, district } } }));
    logHistory({ module: "project", actor: "hafez Rahim", target: projectId, action: "Updated location", details: `${city}${district ? ` · ${district}` : ""}` });
  },
  // ---- Leads CRUD ----
  addLead(input: Omit<Lead, "id" | "updatedAt">, actor = "hafez Rahim") {
    const lead: Lead = { ...input, id: id("L"), updatedAt: "just now" };
    set((s) => ({ ...s, leads: [lead, ...s.leads] }));
    logHistory({ module: "lead", actor, target: lead.company, action: "Lead created" });
  },
  updateLead(leadId: string, patch: Partial<Lead>, actor = "hafez Rahim") {
    let company = leadId;
    set((s) => ({
      ...s,
      leads: s.leads.map((l) => {
        if (l.id === leadId) { company = patch.company ?? l.company; return { ...l, ...patch, updatedAt: "just now" }; }
        return l;
      }),
    }));
    logHistory({ module: "lead", actor, target: company, action: "Updated lead" });
  },
  removeLead(leadId: string, actor = "hafez Rahim") {
    const company = state.leads.find((l) => l.id === leadId)?.company ?? leadId;
    set((s) => ({ ...s, leads: s.leads.filter((l) => l.id !== leadId) }));
    logHistory({ module: "lead", actor, target: company, action: "Deleted lead" });
  },
  // ---- Activity CRUD extras ----
  updateActivity(actId: string, patch: Partial<Activity>, actor = "hafez Rahim") {
    let title = actId;
    set((s) => ({
      ...s,
      activities: s.activities.map((a) => {
        if (a.id === actId) { title = patch.title ?? a.title; return { ...a, ...patch }; }
        return a;
      }),
    }));
    logHistory({ module: "activity", actor, target: title, action: "Updated activity" });
  },
  removeActivity(actId: string, actor = "hafez Rahim") {
    const title = state.activities.find((a) => a.id === actId)?.title ?? actId;
    set((s) => ({ ...s, activities: s.activities.filter((a) => a.id !== actId) }));
    logHistory({ module: "activity", actor, target: title, action: "Deleted activity" });
  },
  // ---- Projects CRUD ----
  addProject(input: Omit<Project, "id">, actor = "hafez Rahim") {
    const project: Project = { ...input, id: id("P") };
    set((s) => ({ ...s, projects: [project, ...s.projects] }));
    logHistory({ module: "project", actor, target: project.name, action: "Project created" });
  },
  updateProject(projectId: string, patch: Partial<Project>, actor = "hafez Rahim") {
    let name = projectId;
    set((s) => ({
      ...s,
      projects: s.projects.map((p) => {
        if (p.id === projectId) { name = patch.name ?? p.name; return { ...p, ...patch }; }
        return p;
      }),
    }));
    logHistory({ module: "project", actor, target: name, action: "Updated project" });
  },
  removeProject(projectId: string, actor = "hafez Rahim") {
    const name = state.projects.find((p) => p.id === projectId)?.name ?? projectId;
    set((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== projectId) }));
    logHistory({ module: "project", actor, target: name, action: "Deleted project" });
  },
  // ---- Attendance CRUD ----
  addAttendance(input: Omit<AttendanceRecord, "id">, actor = "hafez Rahim") {
    const rec: AttendanceRecord = { ...input, id: id("AT") };
    set((s) => ({ ...s, attendance: [rec, ...s.attendance] }));
    logHistory({ module: "employee", actor, target: rec.owner, action: "Attendance logged", details: `${rec.date} ${rec.checkIn}` });
  },
  updateAttendance(recId: string, patch: Partial<AttendanceRecord>, actor = "hafez Rahim") {
    set((s) => ({ ...s, attendance: s.attendance.map((a) => (a.id === recId ? { ...a, ...patch } : a)) }));
    logHistory({ module: "employee", actor, target: recId, action: "Updated attendance" });
  },
  removeAttendance(recId: string, actor = "hafez Rahim") {
    set((s) => ({ ...s, attendance: s.attendance.filter((a) => a.id !== recId) }));
    logHistory({ module: "employee", actor, target: recId, action: "Removed attendance" });
  },
  // ---- Profile ----
  updateProfile(patch: Partial<Profile>, actor = "hafez Rahim") {
    set((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
    logHistory({ module: "employee", actor, target: state.profile.name, action: "Updated profile" });
  },
  // ---- Users CRUD ----
  addUser(input: Omit<AppUser, "id">, actor = "hafez Rahim") {
    const user: AppUser = { ...input, id: id("U") };
    set((s) => ({ ...s, users: [user, ...s.users] }));
    logHistory({ module: "settings", actor, target: user.name, action: "User created", details: user.role });
  },
  updateUser(userId: string, patch: Partial<AppUser>, actor = "hafez Rahim") {
    let name = userId;
    set((s) => ({
      ...s,
      users: s.users.map((u) => {
        if (u.id === userId) { name = patch.name ?? u.name; return { ...u, ...patch }; }
        return u;
      }),
    }));
    logHistory({ module: "settings", actor, target: name, action: "User updated" });
  },
  removeUser(userId: string, actor = "hafez Rahim") {
    const name = state.users.find((u) => u.id === userId)?.name ?? userId;
    set((s) => ({ ...s, users: s.users.filter((u) => u.id !== userId) }));
    logHistory({ module: "settings", actor, target: name, action: "User deleted" });
  },
  setRolePermission(role: UserRoleKey, page: AppPage, ops: CrudOp[]) {
    set((s) => {
      const perm = s.settings.permissions[role];
      const hasPage = ops.length > 0;
      const pages = hasPage
        ? Array.from(new Set([...perm.pages, page]))
        : perm.pages.filter((p) => p !== page);
      return {
        ...s,
        settings: {
          ...s.settings,
          permissions: {
            ...s.settings.permissions,
            [role]: { pages, crud: { ...perm.crud, [page]: ops } },
          },
        },
      };
    });
    logHistory({ module: "settings", actor: "hafez Rahim", target: role, action: "Updated permissions", details: `${page}: ${ops.join(",") || "none"}` });
  },
};

export type { Lead, LeadStatus };