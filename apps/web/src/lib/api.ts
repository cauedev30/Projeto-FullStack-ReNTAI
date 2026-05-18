export type Role = "SOLICITANT" | "SPECIALIST";
export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
export type Specialty =
  | "CARDIOLOGY"
  | "ROBOTIC_SURGERY"
  | "DENTISTRY"
  | "RARE_DISEASES"
  | "OXYGEN_THERAPY";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialty: Specialty | null;
};

export type Session = {
  accessToken: string;
  user: SessionUser;
};

export type Teleconsultation = {
  id: string;
  patientName: string;
  patientBirthDate: string;
  specialty: Specialty;
  diagnosticHypothesis: string;
  clinicalHistory: string;
  status: Status;
  supportDocumentName: string;
  createdAt: string;
  solicitantId: string;
  specialistId: string | null;
  solicitant?: { id: string; name: string; email: string };
  specialist?: { id: string; name: string; email: string; specialty: Specialty | null } | null;
  validation?: {
    score: number;
    provider: string;
    threshold: number;
    accepted: boolean;
    reason: string;
    createdAt: string;
  } | null;
  statusHistory?: Array<{ id: string; status: Status; description: string; createdAt: string }>;
  opinions?: Array<{
    id: string;
    content: string;
    createdAt: string;
    specialist: { id: string; name: string; email: string };
  }>;
};

export const specialtyLabels: Record<Specialty, string> = {
  CARDIOLOGY: "Cardiologia",
  ROBOTIC_SURGERY: "Cirurgia Robotica",
  DENTISTRY: "Odontologia",
  RARE_DISEASES: "Doencas Raras",
  OXYGEN_THERAPY: "Oxigenoterapia"
};

export const statusLabels: Record<Status, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluida",
  CANCELED: "Cancelada"
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export function getSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem("rentai.session");
  return raw ? (JSON.parse(raw) as Session) : null;
}

export function setSession(session: Session) {
  window.localStorage.setItem("rentai.session", JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem("rentai.session");
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getSession();
  const headers = new Headers(init.headers);

  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: "Erro inesperado." }));
    const message = Array.isArray(errorBody.message) ? errorBody.message.join(", ") : errorBody.message;
    throw new Error(message ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

export function apiUrl(path: string) {
  return `${API_URL}${path}`;
}
