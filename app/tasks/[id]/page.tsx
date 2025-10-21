import { createClient } from "@/lib/supabase";
import { format } from "date-fns";

async function updateTask(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const patch = {
    title: String(formData.get("title") || ""),
    description: (formData.get("description") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    status: String(formData.get("status") || "Not Started"),
    progress: Number(formData.get("progress") || 0),
    deliverable_id: (formData.get("deliverable_id") as string) || null,
    building: (formData.get("building") as string) || null,
    tr_id: (formData.get("tr_id") as string) || null
  };
  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  return { error: error?.message };
}

export default async function TaskDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: task } = await supabase.from("tasks_view").select("*").eq("id", params.id).single();
  if (!task) return <div>Task not found</div>;
  const { data: deliverables } = await supabase.from("deliverables").select("*").order("code");

  async function action(data: FormData) {
    "use server";
    return await updateTask(data);
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <h2>Task: {task.title}</h2>
      <form action={action} className="card">
        <input type="hidden" name="id" value={task.id} />
        <label>Title</label>
        <input type="text" name="title" defaultValue={task.title} />
        <label style={{ marginTop: 8 }}>Description</label>
        <textarea name="description" rows={4} defaultValue={task.description || ""} />
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div>
            <label>Start</label>
            <input type="date" name="start_date" defaultValue={task.start_date ? format(new Date(task.start_date), "yyyy-MM-dd") : ""} />
          </div>
          <div>
            <label>Due</label>
            <input type="date" name="due_date" defaultValue={task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : ""} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div>
            <label>Status</label>
            <select name="status" defaultValue={task.status}>
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Review</option>
              <option>Done</option>
            </select>
          </div>
          <div>
            <label>Progress</label>
            <input type="number" name="progress" min="0" max="100" defaultValue={task.progress ?? 0} />
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>DO-117 Context</h3>
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}>
              <label>Deliverable</label>
              <select name="deliverable_id" defaultValue={task.deliverable?.id || ""}>
                <option value="">—</option>
                {deliverables?.map((d:any)=>(
                  <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label>Building</label>
              <input type="text" name="building" defaultValue={task.building || ""} placeholder="e.g., 1300" />
            </div>
            <div style={{ flex:1 }}>
              <label>TR</label>
              <input type="text" name="tr_id" defaultValue={task.tr_id || ""} placeholder="e.g., TR-5-008" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit">Save</button>
        </div>
      </form>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Owner</h3>
        <p>{task.owner?.full_name || task.owner?.email || "—"}</p>
        {task.deliverable && <p><b>Deliverable:</b> {task.deliverable.code} — {task.deliverable.name}</p>}
        {task.building && <p><b>Building:</b> {task.building}</p>}
        {task.tr_id && <p><b>TR:</b> {task.tr_id}</p>}
      </div>

      <p style={{ marginTop: 12 }}><a href="/tasks">← Back</a></p>
    </div>
  );
}
