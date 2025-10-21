import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function submit(formData: FormData) {
  "use server";
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const payload = {
    user_id: user.id,
    date: formData.get("date") as string,
    yesterday: (formData.get("yesterday") as string) || null,
    today: (formData.get("today") as string) || null,
    risks: (formData.get("risks") as string) || null
  };
  const { error } = await supabase.from("daily_updates").upsert(payload, { onConflict: "user_id,date" });
  return { error: error?.message };
}

export default async function TagUpPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().slice(0,10);
  const email = user?.email;

  async function action(data: FormData) {
    "use server";
    return await submit(data);
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <h2>Daily Tag‑Up</h2>
      <p>Signed in as: <b>{email || "Guest (please login)"}</b></p>
      <form action={action} className="card">
        <label>Date</label>
        <input type="date" name="date" defaultValue={today} required />
        <label style={{ marginTop: 8 }}>Yesterday</label>
        <textarea name="yesterday" rows={4} placeholder="What did you complete yesterday?" />
        <label style={{ marginTop: 8 }}>Today</label>
        <textarea name="today" rows={4} placeholder="What are you focusing on today?" />
        <label style={{ marginTop: 8 }}>Risks / Impediments</label>
        <textarea name="risks" rows={3} placeholder="Anything blocking you?" />
        <div style={{ marginTop: 12 }}>
          <button type="submit">Submit</button>
        </div>
      </form>
      <p style={{ marginTop: 12 }}><a href="/">← Back to Dashboard</a></p>
    </div>
  );
}
