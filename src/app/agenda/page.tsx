"use client";

/**
 * /agenda — calendrier + rappels Supabase existants (id, title, due_date).
 * Pas de nouvelle table ; pas d’actions inventées (création / marquage) sans backend.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type Reminder = {
  id: string;
  title: string;
  due_date: string;
};

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

function formatTimeOrDate(due: string): string {
  const d = parseDue(due);
  if (!d) return due;
  const hasTime =
    d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0;
  if (hasTime) {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  return "Toute la journée";
}

export default function AgendaPage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(() => today);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setReminders([]);
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase
      .from("reminders")
      .select("id,title,due_date")
      .eq("user_id", auth.user.id)
      .order("due_date", { ascending: true });

    if (err) {
      setError(err.message || "Impossible de charger l’agenda.");
      setReminders([]);
    } else {
      setReminders((data as Reminder[]) || []);
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
    for (const r of reminders) {
      const d = parseDue(r.due_date);
      if (!d) continue;
      if (d.getFullYear() === y && d.getMonth() === m) set.add(d.getDate());
    }
    return set;
  }, [reminders, cursor]);

  const dayReminders = useMemo(() => {
    return reminders.filter((r) => {
      const d = parseDue(r.due_date);
      return d ? sameDay(d, selected) : false;
    });
  }, [reminders, selected]);

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

  const prevMonth = () => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  };

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
              Tes rappels et échéances enregistrés dans Paipers.
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
                  onClick={prevMonth}
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
                  onClick={nextMonth}
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
                  if (day == null) {
                    return <span key={`e-${i}`} />;
                  }
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
                        color: isSelected
                          ? "#fff"
                          : PAIPERS_COLORS.textPrimary,
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
              ) : dayReminders.length === 0 ? (
                <p className="paipers-text-muted mt-4 text-[13px] leading-relaxed">
                  Aucun rappel pour ce jour. Les échéances enregistrées dans Paipers
                  apparaîtront ici.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2" style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
                  {dayReminders.map((r) => (
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
                        {r.title || "Rappel"}
                      </p>
                      <p className="paipers-text-muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                        {formatTimeOrDate(r.due_date)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {!loading && reminders.length > 0 ? (
                <p className="paipers-text-muted mt-4 text-[12px]" style={{ marginBottom: 0 }}>
                  {reminders.length} rappel{reminders.length > 1 ? "s" : ""} au total
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
