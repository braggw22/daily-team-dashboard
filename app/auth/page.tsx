"use client";

import { createClient } from "@supabase/supabase-js";
import React, { useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) setMessage(error.message);
    else setMessage("Check your email for the login link.");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Login</h2>
      <p>We use email magic links. No password required.</p>
      <form onSubmit={sendMagicLink} className="card">
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{ width: "100%", marginTop: 8, marginBottom: 8 }} />
        <button type="submit">Send Magic Link</button>
      </form>
      {message && <p>{message}</p>}
      <p style={{ marginTop: 16 }}>Admins: set <span className="kbd">ADMIN_EMAILS</span> in <span className="kbd">.env.local</span>.</p>
    </div>
  );
}
