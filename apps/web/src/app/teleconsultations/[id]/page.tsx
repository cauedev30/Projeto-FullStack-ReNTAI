"use client";

import Link from "next/link";
import { FormEvent, use, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  apiFetch,
  getSession,
  Specialty,
  specialtyLabels,
  Status,
  statusLabels,
  Teleconsultation
} from "@/lib/api";

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<Teleconsultation | null>(null);
  const [error, setError] = useState("");
  const session = getSession();

  async function load() {
    const result = await apiFetch<Teleconsultation>(`/teleconsultations/${id}`);
    setItem(result);
  }

  useEffect(() => {
    load().catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Falha ao carregar."));
  }, [id]);

  async function assign() {
    setError("");
    try {
      const result = await apiFetch<Teleconsultation>(`/teleconsultations/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({})
      });
      setItem(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao assumir caso.");
    }
  }

  async function registerOpinion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);

    try {
      const result = await apiFetch<Teleconsultation>(`/teleconsultations/${id}/opinions`, {
        method: "POST",
        body: JSON.stringify({ content: data.get("content") })
      });
      setItem(result);
      event.currentTarget.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao registrar parecer.");
    }
  }

  async function exportPdf() {
    if (!item) return;
    setError("");
    try {
      const token = getSession()?.accessToken;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}/teleconsultations/${item.id}/export.pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error("Falha ao exportar PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `teleconsultoria-${item.id}.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao exportar PDF.");
    }
  }

  if (!item) {
    return (
      <AppShell>
        <p>{error || "Carregando teleconsultoria..."}</p>
      </AppShell>
    );
  }

  const canAssign = session?.user.role === "SPECIALIST" && !item.specialistId;
  const canRegisterOpinion = session?.user.role === "SPECIALIST" && item.specialistId === session.user.id;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Teleconsultoria {item.id.slice(0, 8)}</h1>
          <p>
            {item.patientName} - {specialtyLabels[item.specialty as Specialty]}
          </p>
        </div>
        <div className="stack">
          <Link className="button secondary" href="/dashboard">
            Voltar
          </Link>
          <button type="button" onClick={exportPdf}>
            Exportar PDF
          </button>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <section className="detail-grid">
        <div className="stack">
          <div className="panel">
            <h2>Dados clinicos</h2>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status ${item.status}`}>{statusLabels[item.status as Status]}</span>
            </p>
            <p>
              <strong>Data de nascimento:</strong>{" "}
              {new Date(item.patientBirthDate).toLocaleDateString("pt-BR")}
            </p>
            <p>
              <strong>Hipotese diagnostica:</strong> {item.diagnosticHypothesis}
            </p>
            <p>
              <strong>Historia clinica:</strong> {item.clinicalHistory}
            </p>
            <p>
              <strong>Especialista responsavel:</strong> {item.specialist?.name ?? "Nao atribuido"}
            </p>
            {canAssign ? <button onClick={assign}>Assumir caso</button> : null}
          </div>

          <div className="panel">
            <h2>Pareceres</h2>
            {item.opinions?.length ? (
              item.opinions.map((opinion) => (
                <article key={opinion.id}>
                  <strong>{opinion.specialist.name}</strong>
                  <small> - {new Date(opinion.createdAt).toLocaleString("pt-BR")}</small>
                  <p>{opinion.content}</p>
                </article>
              ))
            ) : (
              <p>Nenhum parecer registrado.</p>
            )}
            {canRegisterOpinion ? (
              <form className="form-grid" onSubmit={registerOpinion}>
                <label>
                  Registrar parecer
                  <textarea name="content" required />
                </label>
                <button type="submit">Registrar Parecer</button>
              </form>
            ) : null}
          </div>
        </div>

        <aside className="stack">
          <div className="panel">
            <h2>Validacao inteligente</h2>
            {item.validation ? (
              <>
                <p>
                  <strong>Score:</strong> {item.validation.score}
                </p>
                <p>
                  <strong>Limiar:</strong> {item.validation.threshold}
                </p>
                <p>
                  <strong>Provider:</strong> {item.validation.provider}
                </p>
                <p>
                  <strong>Resultado:</strong> {item.validation.accepted ? "Aceito" : "Rejeitado"}
                </p>
                <p>{item.validation.reason}</p>
              </>
            ) : (
              <p>Sem validacao registrada.</p>
            )}
          </div>

          <div className="panel">
            <h2>Linha do tempo</h2>
            <ul className="timeline">
              {item.statusHistory?.map((entry) => (
                <li key={entry.id}>
                  <strong>{statusLabels[entry.status as Status]}</strong>
                  <p>{entry.description}</p>
                  <small>{new Date(entry.createdAt).toLocaleString("pt-BR")}</small>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
