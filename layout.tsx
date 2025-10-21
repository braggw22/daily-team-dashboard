import React from "react";
import "./globals.css";

export const metadata = {
  title: "Daily Team Dashboard",
  description: "Supabase + Next.js team task tracker and daily tag-up"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" }}>
        <nav style={{ display: "flex", gap: 16, padding: "12px 16px", alignItems: "center" }}>
          <img src="/bowhead-logo.svg" alt="Bowhead" height={24} style={{ display:"block" }}/>
          <a href="/" style={{ textDecoration: "none" }}>Home</a>
          <a href="/tasks" style={{ textDecoration: "none" }}>Tasks</a>
          <a href="/kanban" style={{ textDecoration: "none" }}>Kanban</a>
          <a href="/calendar" style={{ textDecoration: "none" }}>Calendar</a>
          <a href="/tagup" style={{ textDecoration: "none" }}>Daily Tag‑Up</a>
          <div style={{ marginLeft: "auto" }}>
            <a href="/auth" style={{ textDecoration: "none" }}>Login</a>
          </div>
        </nav>
        <main style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
