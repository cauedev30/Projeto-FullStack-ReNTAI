"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { apiFetch, Specialty } from "@/lib/api";

export default function NewTeleconsultationPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await apiFetch("/teleconsultations", {
        method: "POST",
        body: form
      });
      router.push("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao criar teleconsultoria.");
    }
  }

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Nova Teleconsultoria</h1>
          <p>Preencha os dados clinicos e envie um documento de apoio em PDF ou imagem.</p>
        </div>
      </div>

      <section className="panel">
        <form className="form-grid" onSubmit={submit}>
          <label>
            Nome ou iniciais do paciente
            <input name="patientName" required />
          </label>
          <label>
            Data de nascimento
            <input name="patientBirthDate" type="date" required />
          </label>
          <label>
            Especialidade solicitada
            <select name="specialty" defaultValue={"CARDIOLOGY" satisfies Specialty}>
              <option value="CARDIOLOGY">Cardiologia</option>
              <option value="ROBOTIC_SURGERY">Cirurgia Robotica</option>
              <option value="DENTISTRY">Odontologia</option>
              <option value="RARE_DISEASES">Doencas Raras</option>
              <option value="OXYGEN_THERAPY">Oxigenoterapia</option>
            </select>
          </label>
          <label>
            Hipotese diagnostica
            <textarea name="diagnosticHypothesis" required />
          </label>
          <label>
            Historia clinica resumida
            <textarea name="clinicalHistory" required />
          </label>
          <label>
            Documento de apoio
            <input name="document" type="file" accept="application/pdf,image/png,image/jpeg" required />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit">Enviar para validacao</button>
        </form>
      </section>
    </AppShell>
  );
}
