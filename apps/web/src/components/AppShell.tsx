"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, getSession } from "@/lib/api";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = getSession();

  function logout() {
    clearSession();
    router.push("/");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <strong>ReNTAI</strong>
          <span>Teleconsultoria</span>
        </div>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          {session?.user.role === "SOLICITANT" ? <Link href="/teleconsultations/new">Nova teleconsultoria</Link> : null}
        </nav>
        <div className="sidebar-user">
          <span>{session?.user.name}</span>
          <small>{session?.user.role === "SOLICITANT" ? "Solicitante APS" : "Especialista"}</small>
          <button onClick={logout}>Sair</button>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}
