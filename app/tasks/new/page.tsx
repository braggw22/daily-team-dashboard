import { createClient } from "@/lib/supabase";

async function createTask(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const payload = {
    title: String(formData.get("title") || ""),
    description: (formData.get("description") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    status: String(formData.get("status") || "Not Started"),
    progress: Number(formData.get("progress") || 0),
    owner_id: String(formData.get("owner_id") || user.id),
    deliverable_id: (formData.get("deliverable_id") as string) || null,
    building: (formData.get("building") as string) || null,
    tr_id: (formData.get("tr_id") as string) || null
  };
  const { error, data } = await supabase.from("tasks").insert(payload).select().single();
  return { error: error?.message, data };
}

export default async function NewTaskPage() {
  const supabase = await createClient();
  const { data: deliverables } = await supabase.from("deliverables").select("*").order("code");

  async function action(data: FormData) {
    "use server";
    return await createTask(data);
  }
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2>New Task</h2>
      <form action={action} className="card">
        <label>Title</label>
        <input type="text" name="title" required />
        <label style={{ marginTop: 8 }}>Description</label>
        <textarea name="description" rows={4} />
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div>
            <label>Start</label>
            <input type="date" name="start_date" />
          </div>
          <div>
            <label>Due</label>
            <input type="date" name="due_date" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div>
            <label>Status</label>
            <select name="status" defaultValue="Not Started">
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Review</option>
              <option>Done</option>
            </select>
          </div>
          <div>
            <label>Progress</label>
            <input type="number" name="progress" min="0" max="100" defaultValue="0" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Deliverable</label>
            <select name="deliverable_id">
              <option value="">—</option>
              {deliverables?.map((d:any)=>(
                <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Building</label>
            <input type="text" name="building" placeholder="e.g., BLDG 1300" />
          </div>
          <div style={{ flex: 1 }}>
            <label>TR</label>
            <input type="text" name="tr_id" placeholder="e.g., TR-5-008" />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Owner (User ID, optional)</label>
          <input type="text" name="owner_id" placeholder="defaults to yourself" />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Create</button>
        </div>
      </form>
      <p style={{ marginTop: 12 }}><a href="/tasks">← Back</a></p>
    </div>
  );
}
