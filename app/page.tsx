import { createClient, isAdmin } from "@/lib/supabase";
import { differenceInCalendarDays, format } from "date-fns";

 type Task = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  due_date: string | null;
  status: string;
  progress: number | null;
  owner: { id: string; email: string | null; full_name: string | null } | null;
};

 type Update = {
  id: string;
  created_at: string;
  date: string;
  yesterday: string | null;
  today: string | null;
  risks: string | null;
  user: { id: string; email: string | null; full_name: string | null } | null;
};

 function daysUntil(dateStr: string | null) {
  if (!dateStr) return undefined;
  const now = new Date();
  const d = new Date(dateStr);
  return differenceInCalendarDays(d, now);
}

 export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from("tasks_view")
    .select("*")
    .order("due_date", { ascending: true })
    .returns<Task[]>();

  const { data: updates } = await supabase
    .from("daily_updates_view")
    .select("*")
    .order("date", { ascending: false })
    .limit(25)
    .returns<Update[]>();

  const email = user?.email ?? null;
  const admin = await isAdmin(email);

  return (
    <div className="grid">
      <section className="card" style={{ gridColumn: "1 / -1" }}>
        <h2 style={{ marginTop: 0 }}>
          Team Tasks {admin ? <span className="badge">admin</span> : null}
        </h2>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Owner</th>
              <th>Start</th>
              <th>Due</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {tasks?.map(t => {
              const days = daysUntil(t.due_date);
              const critical = typeof days === "number" && days <= 3;
              return (
                <tr key={t.id} className={critical ? "critical" : ""}>
                  <td>
                    <a href={`/tasks/${t.id}`}>{t.title}</a>
                  </td>
                  <td>{t.owner?.full_name || t.owner?.email || "—"}</td>
                  <td>
                    {t.start_date
                      ? format(new Date(t.start_date), "yyyy-MM-dd")
                      : "—"}
                  </td>
                  <td>
                    {t.due_date
                      ? format(new Date(t.due_date), "yyyy-MM-dd")
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`badge status-${t.status.replaceAll(
                        " ",
                        "\\ "
                      )}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <div className="progress">
                      <div
                        style={{ width: `${t.progress ?? 0}%` }}
                      />
                    </div>
                    <small>{t.progress ?? 0}%</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>
          <a href="/tasks/new">+ New Task</a>
        </p>
      </section>

      <section className="card" style={{ gridColumn: "1 / -1" }}>
        <h2 style={{ marginTop: 0 }}>Daily Tag‑Up (latest 25)</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Person</th>
              <th>Yesterday</th>
              <th>Today</th>
              <th>Risks</th>
            </tr>
          </thead>
          <tbody>
            {updates?.map(u => (
              <tr key={u.id}>
                <td>{u.date}</td>
                <td>{u.user?.full_name || u.user?.email || "—"}</td>
                <td>{u.yesterday || "—"}</td>
                <td>{u.today || "—"}</td>
                <td>{u.risks || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>
          <a href="/tagup">Fill out today’s Tag‑Up →</a>
        </p>
      </section>
    </div>
  );
}
