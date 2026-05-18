import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Specialty, TeleconsultationStatus, UserRole } from "@prisma/client";
import { TeleconsultationsService } from "./teleconsultations.service";

describe("TeleconsultationsService", () => {
  function makeService() {
    const prisma = {
      teleconsultation: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn()
      }
    };
    const validation = {
      validate: jest.fn()
    };
    const gateway = {
      notifyOpinionRegistered: jest.fn()
    };

    return {
      gateway,
      prisma,
      validation,
      service: new TeleconsultationsService(prisma as never, validation as never, gateway as never)
    };
  }

  const solicitant = {
    id: "solicitant-1",
    name: "Solicitante",
    email: "solicitante@rentai.local",
    role: UserRole.SOLICITANT,
    specialty: null
  };

  const specialist = {
    id: "specialist-1",
    name: "Especialista",
    email: "especialista@rentai.local",
    role: UserRole.SPECIALIST,
    specialty: Specialty.CARDIOLOGY
  };

  const clinicalInput = {
    patientName: "Paciente A",
    patientBirthDate: "1980-01-02",
    specialty: Specialty.CARDIOLOGY,
    diagnosticHypothesis: "Hipotese cardiologica",
    clinicalHistory: "Historia clinica resumida"
  };

  const supportFile = {
    originalname: "laudo-clinico.pdf",
    mimetype: "application/pdf",
    path: "uploads/laudo-clinico.pdf"
  } as Express.Multer.File;

  it("inclui o dia inteiro no filtro final dateTo", async () => {
    const { prisma, service } = makeService();

    await service.list(specialist, { status: TeleconsultationStatus.PENDING, dateTo: "2026-05-18" });

    expect(prisma.teleconsultation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({
            lte: new Date("2026-05-18T23:59:59.999Z")
          })
        })
      })
    );
  });

  it("restringe a listagem de solicitantes as proprias teleconsultorias", async () => {
    const { prisma, service } = makeService();

    await service.list(solicitant, {});

    expect(prisma.teleconsultation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          solicitantId: "solicitant-1"
        })
      })
    );
  });

  it("rejeita criacao por especialista antes de validar documento", async () => {
    const { prisma, service, validation } = makeService();

    await expect(service.create(specialist, clinicalInput, supportFile)).rejects.toBeInstanceOf(ForbiddenException);
    expect(validation.validate).not.toHaveBeenCalled();
    expect(prisma.teleconsultation.create).not.toHaveBeenCalled();
  });

  it("rejeita upload abaixo do limiar e nao persiste teleconsultoria", async () => {
    const { prisma, service, validation } = makeService();
    validation.validate.mockResolvedValue({
      score: 0.32,
      provider: "mock",
      threshold: 0.7,
      accepted: false,
      reason: "Documento com baixa confianca clinica."
    });

    await expect(service.create(solicitant, clinicalInput, supportFile)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.teleconsultation.create).not.toHaveBeenCalled();
  });

  it("conclui teleconsultoria e notifica solicitante quando o especialista responsavel registra parecer", async () => {
    const { gateway, prisma, service } = makeService();
    prisma.teleconsultation.findUnique.mockResolvedValue({
      id: "tele-1",
      solicitantId: "solicitant-1",
      specialistId: "specialist-1"
    });
    prisma.teleconsultation.update.mockResolvedValue({
      id: "tele-1",
      patientName: "Paciente A",
      solicitantId: "solicitant-1",
      status: TeleconsultationStatus.COMPLETED
    });

    const result = await service.registerOpinion(specialist, "tele-1", "Parecer clinico detalhado.");

    expect(result.status).toBe(TeleconsultationStatus.COMPLETED);
    expect(prisma.teleconsultation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: TeleconsultationStatus.COMPLETED,
          opinions: { create: { specialistId: "specialist-1", content: "Parecer clinico detalhado." } },
          statusHistory: {
            create: {
              status: TeleconsultationStatus.COMPLETED,
              description: "Parecer registrado e teleconsultoria concluida."
            }
          }
        })
      })
    );
    expect(gateway.notifyOpinionRegistered).toHaveBeenCalledWith(
      "solicitant-1",
      expect.objectContaining({
        teleconsultationId: "tele-1",
        patientName: "Paciente A",
        status: TeleconsultationStatus.COMPLETED
      })
    );
  });

  it("bloqueia parecer de especialista que nao assumiu o caso", async () => {
    const { gateway, prisma, service } = makeService();
    prisma.teleconsultation.findUnique.mockResolvedValue({
      id: "tele-1",
      solicitantId: "solicitant-1",
      specialistId: "specialist-2"
    });

    await expect(service.registerOpinion(specialist, "tele-1", "Parecer indevido.")).rejects.toBeInstanceOf(
      ForbiddenException
    );
    expect(prisma.teleconsultation.update).not.toHaveBeenCalled();
    expect(gateway.notifyOpinionRegistered).not.toHaveBeenCalled();
  });
});
