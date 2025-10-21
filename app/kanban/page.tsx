"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Task = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  due_date: string | null;
  status: "Not Started" | "In Progress" | "Review" | "Done";
  progress: number | null;
};

const COLUMNS: Task["status"][] = ["Not Started", "In Progress", "Review", "Done"];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabaseBrowser.from("tasks").select("*").order("created_at", { ascending: true });
    if (!error && data) setTasks(data as any);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function moveTask(id: string, status: Task["status"]) {
    const { error } = await supabaseBrowser.from("tasks").update({ status }).eq("id", id);
    if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
  }

  function onDrop(e: React.DragEvent, status: Task["status"]) {
    const id = e.dataTransfer.getData("text/plain");
    if (id) moveTask(id, status);
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); }

  return (
    <div>
      <h2>Kanban</h2>
      {!loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {COLUMNS.map(col => (
            <div key={col} className="card" onDrop={e => onDrop(e, col)} onDragOver={onDragOver}>
              <h3 style={{ marginTop: 0 }}>{col}</h3>
              {tasks.filter(t => t.status === col).map(t => (
                <div
                  key={t.id}
                  className="card"
                  draggable
                  onDragStart={e => onDragStart(e, t.id)}
                  style={{ marginBottom: 8, cursor: "grab" }}
                >
                  <b style={{ display: "block" }}>{t.title}</b>
                  {t.due_date ? <small>Due: {t.due_date}</small> : <small>No due date</small>}
                  <div className="progress" style={{ marginTop: 8 }}><div style={{ width: `${t.progress ?? 0}%` }} /></div>
                </div>
              ))}
              {tasks.filter(t => t.status === col).length === 0 && <p style={{ color: "#888" }}>Drop here</p>}
            </div>
          ))}
        </div>
      ) : <p>Loading…</p>}
      <p style={{ marginTop: 12 }}><a href="/tasks">Manage tasks →</a></p>
    </div>
  );
}
