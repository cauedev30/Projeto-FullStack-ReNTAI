import { Injectable } from "@nestjs/common";

export type DocumentValidationResult = {
  score: number;
  provider: string;
  threshold: number;
  accepted: boolean;
  reason: string;
};

@Injectable()
export class DocumentValidationService {
  async validate(file: Express.Multer.File): Promise<DocumentValidationResult> {
    const threshold = Number(process.env.DOCUMENT_VALIDATION_THRESHOLD ?? 0.7);
    const provider = process.env.DOCUMENT_VALIDATION_PROVIDER ?? "mock";
    const filename = file.originalname.toLowerCase();
    const mime = file.mimetype.toLowerCase();

    let score = 0.82;
    let reason = "Documento possui formato aceito e caracteristicas compativeis com anexo clinico.";

    if (!["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(mime)) {
      score = 0.15;
      reason = "Formato nao aceito para documento de apoio clinico.";
    } else if (filename.includes("invalid") || filename.includes("teste-baixo-score")) {
      score = 0.32;
      reason = "Mock configurado para simular documento com baixa confianca clinica.";
    } else if (filename.includes("clinico") || filename.includes("laudo") || filename.includes("exame")) {
      score = 0.94;
      reason = "Nome e formato sugerem documento clinico legitimo.";
    }

    return {
      score,
      provider,
      threshold,
      accepted: score >= threshold,
      reason
    };
  }
}
