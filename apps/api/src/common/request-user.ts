import { Specialty, UserRole } from "@prisma/client";
import { Request } from "express";

export type RequestUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty: Specialty | null;
};

export type AuthenticatedRequest = Request & {
  user: RequestUser;
};
