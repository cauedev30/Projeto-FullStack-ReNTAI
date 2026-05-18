import { PrismaClient, Specialty, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "solicitante@rentai.local" },
    update: {},
    create: {
      name: "Solicitante APS",
      email: "solicitante@rentai.local",
      passwordHash,
      role: UserRole.SOLICITANT
    }
  });

  await prisma.user.upsert({
    where: { email: "especialista@rentai.local" },
    update: {},
    create: {
      name: "Especialista Cardiologia",
      email: "especialista@rentai.local",
      passwordHash,
      role: UserRole.SPECIALIST,
      specialty: Specialty.CARDIOLOGY
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
