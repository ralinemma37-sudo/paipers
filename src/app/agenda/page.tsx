"use client";

/**
 * /agenda — calendrier + échéances dérivées des documents (metadata).
 * Pas de table reminders ; lien vers le document si disponible.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import {
  fetchAgendaEventsFromDocuments,
  type AgendaEvent,
} from "@/lib/agendaEvents";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseDue(due: string): Date | null {
  const d = new Date(due);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateOnly(due: string): string {
  const d = parseDue(due);
  if (!d) return due;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AgendaPage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(() => today);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { events: next, error: err } = await fetchAgendaEventsFromDocuments();
    if (err) {
      setError(err);
      setEvents([]);
    } else {
      setEvents(next);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const eventDays = useMemo(() => {
    const set = new Set<number>();
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    for (const r of events) {
      const d = parseDue(r.due_date);
      if (!d) continue;
      if (d.getFullYear() === y && d.getMonth() === m) set.add(d.getDate());
    }
    return set;
  }, [events, cursor]);

  const dayEvents = useMemo(() => {
    return events.filter((r) => {
      const d = parseDue(r.due_date);
      return d ? sameDay(d, selected) : false;
    });
  }, [events, selected]);

  const monthLabel = cursor.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const cells = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const firstDow = new Date(y, m, 1).getDay();
    const startOffset = (firstDow + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const list: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(d);
    return list;
  }, [cursor]);

  return (
    <Protected>
      <AppShell>
        <div className="pb-24 md:pb-6" style={{ padding: PAIPERS_SPACE.screenPad }}>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold mb-4"
            style={{ color: PAIPERS_COLORS.navy, textDecoration: "none" }}
          >
            <ArrowLeft size={16} />
            Retour à l’accueil
          </Link>

          <div className="mb-5">
            <h1 className="paipers-screen-title" style={{ marginBottom: 4 }}>
              Agenda
            </h1>
            <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14 }}>
              Échéances détectées sur tes documents (dates d’expiration et dates
              importantes).
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              style={{
                padding: 14,
                borderRadius: 14,
                background: "rgba(185, 28, 28, 0.08)",
                border: "1px solid rgba(185, 28, 28, 0.25)",
                marginBottom: 16,
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, color: "#991B1B" }}>{error}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-2 text-[13px] font-bold border-0 bg-transparent cursor-pointer"
                style={{ color: PAIPERS_COLORS.navy, padding: 0 }}
              >
                Réessayer
              </button>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            <div className="paipers-card-white p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
                  }
                  aria-label="Mois précédent"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-0 cursor-pointer"
                  style={{ background: DESKTOP_SURFACES.canvasAlt }}
                >
                  <ChevronLeft size={18} color={PAIPERS_COLORS.navy} />
                </button>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
                    textTransform: "capitalize",
                    color: PAIPERS_COLORS.textPrimary,
                  }}
                >
                  {monthLabel}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
                  }
                  aria-label="Mois suivant"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-0 cursor-pointer"
                  style={{ background: DESKTOP_SURFACES.canvasAlt }}
                >
                  <ChevronRight size={18} color={PAIPERS_COLORS.navy} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 4,
                }}
              >
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <span
                    key={`${d}-${i}`}
                    className="paipers-text-muted text-center text-[11px] font-bold py-1"
                  >
                    {d}
                  </span>
                ))}
                {cells.map((day, i) => {
                  if (day == null) return <span key={`e-${i}`} />;
                  const cellDate = new Date(cursor.getFullYear(), cursor.getMonth(), day);
                  const isSelected = sameDay(cellDate, selected);
                  const isToday = sameDay(cellDate, today);
                  const hasEvent = eventDays.has(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelected(cellDate)}
                      aria-label={`${day} ${monthLabel}`}
                      aria-pressed={isSelected}
                      className="relative border-0 cursor-pointer rounded-lg py-2 text-[13px] font-semibold"
                      style={{
                        background: isSelected
                          ? PAIPERS_COLORS.navy
                          : isToday
                            ? PAIPERS_COLORS.navyMuted
                            : "transparent",
                        color: isSelected ? "#fff" : PAIPERS_COLORS.textPrimary,
                      }}
                    >
                      {day}
                      {hasEvent ? (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            bottom: 4,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 5,
                            height: 5,
                            borderRadius: 999,
                            background: isSelected
                              ? DESKTOP_SURFACES.accentLine
                              : PAIPERS_COLORS.personalGradientStart,
                          }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="paipers-card-muted p-4 min-h-[220px]">
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 800,
                  color: PAIPERS_COLORS.textPrimary,
                  textTransform: "capitalize",
                }}
              >
                {formatDayLabel(selected)}
              </p>

              {loading ? (
                <p className="paipers-text-muted mt-4 text-[13px]" aria-busy>
                  Chargement…
                </p>
              ) : dayEvents.length === 0 ? (
                <p className="paipers-text-muted mt-4 text-[13px] leading-relaxed">
                  Aucune échéance pour ce jour. Les dates d’expiration et dates
                  importantes détectées sur tes documents apparaîtront ici.
                </p>
              ) : (
                <ul
                  className="mt-3 flex flex-col gap-2"
                  style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}
                >
                  {dayEvents.map((r) => (
                    <li
                      key={r.id}
                      className="paipers-card-white"
                      style={{ padding: "12px 14px" }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 800,
                          color: PAIPERS_COLORS.textPrimary,
                        }}
                      >
                        {r.title}
                      </p>
                      <p
                        className="paipers-text-muted"
                        style={{ margin: "4px 0 0", fontSize: 12 }}
                      >
                        {formatDateOnly(r.due_date)}
                        {" · "}
                        {r.kind === "expiration" ? "Expiration" : "Date importante"}
                      </p>
                      {r.documentId ? (
                        <Link
                          href={`/documents/view?id=${r.documentId}`}
                          className="inline-flex items-center gap-1 mt-2 text-[12px] font-bold"
                          style={{ color: PAIPERS_COLORS.navy, textDecoration: "none" }}
                        >
                          Ouvrir le document
                          <ExternalLink size={12} />
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}

              {!loading && events.length > 0 ? (
                <p
                  className="paipers-text-muted mt-4 text-[12px]"
                  style={{ marginBottom: 0 }}
                >
                  {events.length} échéance{events.length > 1 ? "s" : ""} au total
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
