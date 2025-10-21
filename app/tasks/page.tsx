import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default async function TasksPage({ searchParams }: { searchParams?: Record<string,string|undefined> }) {
  const supabase = createClient();
  const dcode = searchParams?.deliverable_code || "";
  const building = searchParams?.building || "";
  const owner = searchParams?.owner || "";

  let query = supabase.from("tasks_view").select("*").order("due_date", { ascending: true });

  if (dcode) {
    // filter by deliverable code via subselect
    const { data: d } = await supabase.from("deliverables").select("id").eq("code", dcode).single();
    if (d) query = query.eq("deliverable_id", d.id);
  }
  if (building) query = query.ilike("building", `%${building}%`);
  if (owner) query = query.ilike("owner->>email", `%${owner}%`);

  const { data: tasks } = await query;

  const { data: deliverables } = await supabase.from("deliverables").select("*").order("code");

  return (
    <div>
      <h2>Tasks</h2>
      <form method="get" className="card" style={{ display:"grid", gridTemplateColumns: "repeat(4, 1fr)", gap:12, alignItems:"end" }}>
        <div>
          <label>Deliverable</label>
          <select name="deliverable_code" defaultValue={dcode || ""}>
            <option value="">All</option>
            {deliverables?.map((d:any)=>(
              <option key={d.id} value={d.code}>{d.code} — {d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Building</label>
          <input type="text" name="building" defaultValue={building || ""} placeholder="e.g., 1300" />
        </div>
        <div>
          <label>Owner (email)</label>
          <input type="text" name="owner" defaultValue={owner || ""} placeholder="e.g., weston" />
        </div>
        <div>
          <button type="submit" className="btn">Filter</button>
        </div>
      </form>
      <p><Link href="/tasks/new">+ New Task</Link></p>
      <table>
        <thead><tr><th>Task</th><th>Deliverable</th><th>Building</th><th>Owner</th><th>Start</th><th>Due</th><th>Status</th><th>Progress</th></tr></thead>
        <tbody>
          {tasks?.map((t:any)=>(
            <tr key={t.id}>
              <td><Link href={`/tasks/${t.id}`}>{t.title}</Link></td>
              <td>{t.deliverable ? `${t.deliverable.code} — ${t.deliverable.name}` : "—"}</td>
              <td>{t.building || "—"}</td>
              <td>{t.owner?.full_name || t.owner?.email || "—"}</td>
              <td>{t.start_date || "—"}</td>
              <td>{t.due_date || "—"}</td>
              <td>{t.status}</td>
              <td>{t.progress ?? 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
