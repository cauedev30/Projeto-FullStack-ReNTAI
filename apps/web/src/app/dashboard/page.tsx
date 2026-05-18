"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AppShell } from "@/components/AppShell";
import {
  apiFetch,
  getSession,
  Specialty,
  specialtyLabels,
  statusLabels,
  Status,
  Teleconsultation
} from "@/lib/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3333";

export default function DashboardPage() {
  const [items, setItems] = useState<Teleconsultation[]>([]);
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", dateFrom: "", dateTo: "" });
  const session = getSession();

  async function load() {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const result = await apiFetch<Teleconsultation[]>(`/teleconsultations?${query.toString()}`);
    setItems(result);
  }

  useEffect(() => {
    load().catch((error) => setNotice(error instanceof Error ? error.message : "Falha ao carregar."));
  }, []);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on("opinion.registered", (payload: { message: string; patientName: string }) => {
      setNotice(`${payload.message} Paciente: ${payload.patientName}`);
      load().catch(() => undefined);
    });
    return () => {
      socket.disconnect();
    };
  }, [session?.accessToken]);

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    load().catch((error) => setNotice(error instanceof Error ? error.message : "Falha ao filtrar."));
  }

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Busque e acompanhe teleconsultorias por paciente, especialidade, status e data.</p>
        </div>
        {session?.user.role === "SOLICITANT" ? (
          <Link className="button" href="/teleconsultations/new">
            Nova Teleconsultoria
          </Link>
        ) : null}
      </div>

      {notice ? <div className="notice">{notice}</div> : null}

      <form className="toolbar" onSubmit={submitFilters}>
        <input
          placeholder="Buscar por paciente ou especialidade"
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
        />
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
        >
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
        />
        <button type="submit">Filtrar</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Paciente</th>
            <th>Especialidade</th>
            <th>Data</th>
            <th>Status</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id.slice(0, 8)}</td>
              <td>{item.patientName}</td>
              <td>{specialtyLabels[item.specialty as Specialty]}</td>
              <td>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</td>
              <td>
                <span className={`status ${item.status}`}>{statusLabels[item.status as Status]}</span>
              </td>
              <td>
                <Link className="button secondary" href={`/teleconsultations/${item.id}`}>
                  Ver detalhes
                </Link>
              </td>
            </tr>
          ))}
          {!items.length ? (
            <tr>
              <td colSpan={6}>Nenhuma teleconsultoria encontrada.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </AppShell>
  );
}
