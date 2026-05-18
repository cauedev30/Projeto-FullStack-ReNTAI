import { Specialty, TeleconsultationStatus } from "@prisma/client";

export const specialtyLabels: Record<Specialty, string> = {
  CARDIOLOGY: "Cardiologia",
  ROBOTIC_SURGERY: "Cirurgia Robotica",
  DENTISTRY: "Odontologia",
  RARE_DISEASES: "Doencas Raras",
  OXYGEN_THERAPY: "Oxigenoterapia"
};

export const statusLabels: Record<TeleconsultationStatus, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluida",
  CANCELED: "Cancelada"
};
