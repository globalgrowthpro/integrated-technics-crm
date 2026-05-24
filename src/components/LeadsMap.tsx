import { useMemo, useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Lead } from "@/lib/mock-data";
import { fmtMoney } from "@/lib/mock-data";

type CityAgg = { city: string; lat: number; lng: number; count: number; value: number; leads: Lead[] };

function FitBounds({ points, focus }: { points: [number, number][]; focus: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.setView(focus, 10, { animate: true });
      return;
    }
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 6);
    } else {
      map.fitBounds(points as any, { padding: [40, 40] });
    }
  }, [map, points, focus]);
  return null;
}

export function LeadsMap({ leads }: { leads: Lead[] }) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const cities = useMemo<CityAgg[]>(() => {
    const map = new Map<string, CityAgg>();
    for (const l of leads) {
      const key = l.city;
      const cur = map.get(key);
      if (cur) {
        cur.count += 1;
        cur.value += l.value;
        cur.leads.push(l);
      } else {
        map.set(key, { city: l.city, lat: l.lat, lng: l.lng, count: 1, value: l.value, leads: [l] });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [leads]);

  const maxCount = Math.max(...cities.map((c) => c.count), 1);
  const points = cities.map((c) => [c.lat, c.lng] as [number, number]);
  const selected = cities.find((c) => c.city === selectedCity) ?? null;
  const focus = selected ? ([selected.lat, selected.lng] as [number, number]) : null;
  const totalCount = cities.reduce((s, c) => s + c.count, 0);
  const totalValue = cities.reduce((s, c) => s + c.value, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]" style={{ height: 520 }}>
        <MapContainer
          center={[26.8206, 30.8025]}
          zoom={5}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} focus={focus} />
          {cities.map((c) => {
            const r = 10 + (c.count / maxCount) * 22;
            const isSelected = selectedCity === c.city;
            const dim = selectedCity && !isSelected;
            return (
              <CircleMarker
                key={c.city}
                center={[c.lat, c.lng]}
                radius={r}
                eventHandlers={{ click: () => setSelectedCity(isSelected ? null : c.city) }}
                pathOptions={{
                  color: isSelected ? "oklch(0.55 0.22 27)" : "oklch(0.706 0.181 49.5)",
                  fillColor: isSelected ? "oklch(0.65 0.22 27)" : "oklch(0.706 0.181 49.5)",
                  fillOpacity: dim ? 0.15 : isSelected ? 0.7 : 0.55,
                  weight: isSelected ? 3 : 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={1} permanent>
                  <span style={{ fontWeight: 700 }}>{c.city}</span> · {c.count}
                </Tooltip>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.city}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{c.count} leads · {fmtMoney(c.value)}</div>
                    <ul style={{ marginTop: 6, paddingInlineStart: 16, fontSize: 12 }}>
                      {c.leads.slice(0, 5).map((l) => (
                        <li key={l.id}>{l.company} — {fmtMoney(l.value)}</li>
                      ))}
                    </ul>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Leads by City</h3>
          {selectedCity && (
            <button
              onClick={() => setSelectedCity(null)}
              className="rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-accent"
            >
              Reset
            </button>
          )}
        </div>
        <div className="mt-2 rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground">
          {selected
            ? <><span className="font-semibold text-foreground">{selected.city}</span> · {selected.count} leads · {fmtMoney(selected.value)}</>
            : <>{totalCount} leads across {cities.length} cities · {fmtMoney(totalValue)}</>}
        </div>
        <div className="mt-3 space-y-2">
          {cities.map((c) => {
            const pct = (c.count / maxCount) * 100;
            const isSelected = selectedCity === c.city;
            return (
              <button
                key={c.city}
                type="button"
                onClick={() => setSelectedCity(isSelected ? null : c.city)}
                className={`w-full rounded-lg border p-3 text-start transition ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-[var(--shadow-brand)]"
                    : "border-border bg-background hover:border-primary/50 hover:bg-accent/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{c.city}</span>
                  <span className="font-mono text-sm font-bold text-primary">{c.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">{fmtMoney(c.value)} pipeline</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}