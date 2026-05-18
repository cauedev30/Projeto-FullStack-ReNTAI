"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setSession, Session, Specialty } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    const data = new FormData(event.currentTarget);

    try {
      const session = await apiFetch<Session>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password")
        })
      });
      setSession(session);
      router.push("/dashboard");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Falha ao entrar.");
    }
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError("");
    const data = new FormData(event.currentTarget);
    const role = String(data.get("role"));

    try {
      const session = await apiFetch<Session>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          password: data.get("password"),
          role,
          specialty: role === "SPECIALIST" ? (data.get("specialty") as Specialty) : undefined
        })
      });
      setSession(session);
      router.push("/dashboard");
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Falha ao cadastrar.");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div>
          <h1>ReNTAI Teleconsultoria</h1>
          <p>
            Modulo para solicitacao, acompanhamento e registro de pareceres em teleconsultorias,
            com validacao inteligente de documentos.
          </p>
          <p>
            Usuarios de exemplo: <strong>solicitante@rentai.local</strong> e{" "}
            <strong>especialista@rentai.local</strong>. Senha: <strong>123456</strong>.
          </p>
        </div>

        <div className="stack">
          <form className="auth-form" onSubmit={login}>
            <h2>Entrar</h2>
            <label>
              Email
              <input name="email" type="email" defaultValue="solicitante@rentai.local" required />
            </label>
            <label>
              Senha
              <input name="password" type="password" defaultValue="123456" required />
            </label>
            {loginError ? <p className="error">{loginError}</p> : null}
            <button type="submit">Entrar</button>
          </form>

          <form className="auth-form" onSubmit={register}>
            <h2>Cadastrar usuario</h2>
            <label>
              Nome
              <input name="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Senha
              <input name="password" type="password" minLength={6} required />
            </label>
            <label>
              Perfil
              <select name="role" defaultValue="SOLICITANT">
                <option value="SOLICITANT">Solicitante APS</option>
                <option value="SPECIALIST">Especialista</option>
              </select>
            </label>
            <label>
              Especialidade para especialista
              <select name="specialty" defaultValue="CARDIOLOGY">
                <option value="CARDIOLOGY">Cardiologia</option>
                <option value="ROBOTIC_SURGERY">Cirurgia Robotica</option>
                <option value="DENTISTRY">Odontologia</option>
                <option value="RARE_DISEASES">Doencas Raras</option>
                <option value="OXYGEN_THERAPY">Oxigenoterapia</option>
              </select>
            </label>
            {registerError ? <p className="error">{registerError}</p> : null}
            <button type="submit">Cadastrar e entrar</button>
          </form>
        </div>
      </section>
    </main>
  );
}
