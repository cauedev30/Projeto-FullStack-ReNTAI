import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Specialty, TeleconsultationStatus, UserRole } from "@prisma/client";
import PDFDocument from "pdfkit";
import { RequestUser } from "../common/request-user";
import { specialtyLabels, statusLabels } from "../common/specialty-labels";
import { PrismaService } from "../database/prisma.service";
import { DocumentValidationService } from "../document-validation/document-validation.service";
import { TeleconsultationsGateway } from "./teleconsultations.gateway";

type CreateTeleconsultationInput = {
  patientName: string;
  patientBirthDate: string;
  specialty: Specialty;
  diagnosticHypothesis: string;
  clinicalHistory: string;
};

type ListQuery = {
  search?: string;
  status?: TeleconsultationStatus;
  dateFrom?: string;
  dateTo?: string;
};

@Injectable()
export class TeleconsultationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentValidation: DocumentValidationService,
    private readonly gateway: TeleconsultationsGateway
  ) {}

  async list(user: RequestUser, query: ListQuery) {
    const where: Record<string, unknown> = {};

    if (user.role === UserRole.SOLICITANT) {
      where.solicitantId = user.id;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        gte: query.dateFrom ? this.startOfUtcDate(query.dateFrom) : undefined,
        lte: query.dateTo ? this.endOfUtcDate(query.dateTo) : undefined
      };
    }

    if (query.search) {
      const matchedSpecialties = Object.entries(specialtyLabels)
        .filter(([, label]) => label.toLowerCase().includes(query.search!.toLowerCase()))
        .map(([key]) => key as Specialty);

      where.OR = [
        { patientName: { contains: query.search } },
        ...(matchedSpecialties.length ? [{ specialty: { in: matchedSpecialties } }] : [])
      ];
    }

    return this.prisma.teleconsultation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        solicitant: { select: { id: true, name: true, email: true } },
        specialist: { select: { id: true, name: true, email: true, specialty: true } },
        validation: true,
        opinions: true
      }
    });
  }

  async create(user: RequestUser, input: CreateTeleconsultationInput, file?: Express.Multer.File) {
    if (user.role !== UserRole.SOLICITANT) {
      throw new ForbiddenException("Apenas solicitantes podem criar teleconsultorias.");
    }

    if (!file) {
      throw new BadRequestException("Documento de apoio e obrigatorio.");
    }

    this.validateCreateInput(input);
    const validation = await this.documentValidation.validate(file);

    if (!validation.accepted) {
      throw new BadRequestException({
        message: `Documento rejeitado pela validacao inteligente. Score: ${validation.score}. Limiar: ${validation.threshold}.`,
        validation
      });
    }

    return this.prisma.teleconsultation.create({
      data: {
        patientName: input.patientName,
        patientBirthDate: new Date(input.patientBirthDate),
        specialty: input.specialty,
        diagnosticHypothesis: input.diagnosticHypothesis,
        clinicalHistory: input.clinicalHistory,
        supportDocumentName: file.originalname,
        supportDocumentPath: file.path,
        supportDocumentMime: file.mimetype,
        solicitantId: user.id,
        validation: {
          create: validation
        },
        statusHistory: {
          create: {
            status: TeleconsultationStatus.PENDING,
            description: "Teleconsultoria criada pelo solicitante."
          }
        }
      },
      include: this.detailInclude()
    });
  }

  async detail(user: RequestUser, id: string) {
    const item = await this.prisma.teleconsultation.findUnique({
      where: { id },
      include: this.detailInclude()
    });

    if (!item) {
      throw new NotFoundException("Teleconsultoria nao encontrada.");
    }

    this.ensureCanView(user, item.solicitantId);
    return item;
  }

  async assign(user: RequestUser, id: string) {
    if (user.role !== UserRole.SPECIALIST) {
      throw new ForbiddenException("Apenas especialistas podem assumir casos.");
    }

    const item = await this.prisma.teleconsultation.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException("Teleconsultoria nao encontrada.");
    }

    if (item.specialistId && item.specialistId !== user.id) {
      throw new BadRequestException("Esta teleconsultoria ja possui especialista responsavel.");
    }

    return this.prisma.teleconsultation.update({
      where: { id },
      data: {
        specialistId: user.id,
        status: TeleconsultationStatus.IN_PROGRESS,
        statusHistory: {
          create: {
            status: TeleconsultationStatus.IN_PROGRESS,
            description: `Caso assumido por ${user.name}.`
          }
        }
      },
      include: this.detailInclude()
    });
  }

  async registerOpinion(user: RequestUser, id: string, content: string) {
    if (user.role !== UserRole.SPECIALIST) {
      throw new ForbiddenException("Apenas especialistas podem registrar parecer.");
    }

    if (!content?.trim()) {
      throw new BadRequestException("O parecer nao pode estar vazio.");
    }

    const item = await this.prisma.teleconsultation.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException("Teleconsultoria nao encontrada.");
    }

    if (item.specialistId !== user.id) {
      throw new ForbiddenException("Apenas o especialista responsavel pode registrar parecer.");
    }

    const updated = await this.prisma.teleconsultation.update({
      where: { id },
      data: {
        status: TeleconsultationStatus.COMPLETED,
        opinions: {
          create: {
            specialistId: user.id,
            content
          }
        },
        statusHistory: {
          create: {
            status: TeleconsultationStatus.COMPLETED,
            description: "Parecer registrado e teleconsultoria concluida."
          }
        }
      },
      include: this.detailInclude()
    });

    this.gateway.notifyOpinionRegistered(updated.solicitantId, {
      teleconsultationId: updated.id,
      patientName: updated.patientName,
      status: updated.status,
      message: "Um parecer foi registrado para sua teleconsultoria."
    });

    return updated;
  }

  async buildPdf(user: RequestUser, id: string): Promise<Buffer> {
    const item = await this.detail(user, id);

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 48 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text("Resumo da Teleconsultoria", { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`ID: ${item.id}`);
      doc.text(`Paciente: ${item.patientName}`);
      doc.text(`Data de nascimento: ${item.patientBirthDate.toISOString().slice(0, 10)}`);
      doc.text(`Especialidade: ${specialtyLabels[item.specialty]}`);
      doc.text(`Status: ${statusLabels[item.status]}`);
      doc.moveDown();
      doc.text(`Hipotese diagnostica: ${item.diagnosticHypothesis}`);
      doc.text(`Historia clinica: ${item.clinicalHistory}`);
      doc.moveDown();

      if (item.validation) {
        doc.text("Validacao do documento");
        doc.text(`Provider: ${item.validation.provider}`);
        doc.text(`Score: ${item.validation.score}`);
        doc.text(`Limiar: ${item.validation.threshold}`);
        doc.text(`Resultado: ${item.validation.accepted ? "Aceito" : "Rejeitado"}`);
        doc.moveDown();
      }

      doc.text("Pareceres");
      if (!item.opinions.length) {
        doc.text("Nenhum parecer registrado.");
      } else {
        for (const opinion of item.opinions) {
          doc.moveDown(0.5);
          doc.text(`${opinion.specialist.name} - ${opinion.createdAt.toISOString()}`);
          doc.text(opinion.content);
        }
      }

      doc.end();
    });
  }

  private validateCreateInput(input: CreateTeleconsultationInput) {
    if (
      !input.patientName ||
      !input.patientBirthDate ||
      !input.specialty ||
      !input.diagnosticHypothesis ||
      !input.clinicalHistory
    ) {
      throw new BadRequestException("Todos os campos clinicos sao obrigatorios.");
    }

    if (!Object.values(Specialty).includes(input.specialty)) {
      throw new BadRequestException("Especialidade invalida.");
    }
  }

  private startOfUtcDate(date: string) {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private endOfUtcDate(date: string) {
    return new Date(`${date}T23:59:59.999Z`);
  }

  private ensureCanView(user: RequestUser, solicitantId: string) {
    if (user.role === UserRole.SOLICITANT && solicitantId !== user.id) {
      throw new ForbiddenException("Solicitantes so podem visualizar as proprias teleconsultorias.");
    }
  }

  private detailInclude() {
    return {
      solicitant: { select: { id: true, name: true, email: true } },
      specialist: { select: { id: true, name: true, email: true, specialty: true } },
      validation: true,
      statusHistory: { orderBy: { createdAt: "asc" as const } },
      opinions: {
        orderBy: { createdAt: "asc" as const },
        include: {
          specialist: { select: { id: true, name: true, email: true, specialty: true } }
        }
      }
    };
  }
}
