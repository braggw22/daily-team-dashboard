"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Task = {
  id: string;
  title: string;
  due_date: string | null;
  start_date: string | null;
  status: string;
};

function getMonthMatrix(year: number, month0: number) {
  // returns weeks x 7 matrix of Date objects for rendering a month
  const first = new Date(year, month0, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // Monday-start
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w*7 + d);
      row.push(day);
    }
    weeks.push(row);
  }
  return weeks;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m0: now.getMonth() };
  });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabaseBrowser.from("tasks").select("id,title,due_date,start_date,status");
      if (!error && data) setTasks(data as any);
    })();
  }, []);

  const matrix = useMemo(() => getMonthMatrix(cursor.y, cursor.m0), [cursor]);

  function fmt(d: Date) { return d.toISOString().slice(0,10); }

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (!t.due_date) continue;
      (map[t.due_date] ||= []).push(t);
    }
    return map;
  }, [tasks]);

  const monthLabel = new Date(cursor.y, cursor.m0, 1).toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div>
      <h2>Calendar</h2>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <button onClick={() => setCursor(c => ({ y: c.m0 === 0 ? c.y - 1 : c.y, m0: c.m0 === 0 ? 11 : c.m0 - 1 }))}>←</button>
        <b>{monthLabel}</b>
        <button onClick={() => setCursor(c => ({ y: c.m0 === 11 ? c.y + 1 : c.y, m0: c.m0 === 11 ? 0 : c.m0 + 1 }))}>→</button>
        <button onClick={() => {
          const n = new Date();
          setCursor({ y: n.getFullYear(), m0: n.getMonth() });
        }}>Today</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} style={{ textAlign: "center", fontWeight: 600 }}>{d}</div>)}
        {matrix.flat().map((d, i) => {
          const key = fmt(d);
          const inMonth = d.getMonth() === cursor.m0;
          const dayTasks = tasksByDate[key] || [];
          return (
            <div key={i} className="card" style={{ opacity: inMonth ? 1 : 0.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems:"baseline" }}>
                <b>{d.getDate()}</b>
                <small>{dayTasks.length ? `${dayTasks.length} task${dayTasks.length>1?'s':''}` : ""}</small>
              </div>
              <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 6 }}>
                {dayTasks.slice(0, 4).map(t => (
                  <li key={t.id}><a href={`/tasks/${t.id}`}>{t.title}</a></li>
                ))}
                {dayTasks.length > 4 && <li><small>+{dayTasks.length - 4} more</small></li>}
              </ul>
            </div>
          );
        })}
      </div>
      <p style={{ marginTop: 12 }}><a href="/tasks">Manage tasks →</a></p>
    </div>
  );
}
