import { DocumentValidationService } from "./document-validation.service";

describe("DocumentValidationService", () => {
  const previousThreshold = process.env.DOCUMENT_VALIDATION_THRESHOLD;
  const previousProvider = process.env.DOCUMENT_VALIDATION_PROVIDER;

  afterEach(() => {
    if (previousThreshold === undefined) {
      delete process.env.DOCUMENT_VALIDATION_THRESHOLD;
    } else {
      process.env.DOCUMENT_VALIDATION_THRESHOLD = previousThreshold;
    }

    if (previousProvider === undefined) {
      delete process.env.DOCUMENT_VALIDATION_PROVIDER;
    } else {
      process.env.DOCUMENT_VALIDATION_PROVIDER = previousProvider;
    }
  });

  function file(originalname: string, mimetype: string) {
    return { originalname, mimetype } as Express.Multer.File;
  }

  it("aceita PDF ou imagem clinica quando score alcanca o limiar configurado", async () => {
    process.env.DOCUMENT_VALIDATION_THRESHOLD = "0.9";
    process.env.DOCUMENT_VALIDATION_PROVIDER = "mock-test";
    const service = new DocumentValidationService();

    const result = await service.validate(file("laudo-clinico.pdf", "application/pdf"));

    expect(result).toMatchObject({
      accepted: true,
      provider: "mock-test",
      threshold: 0.9,
      score: 0.94
    });
  });

  it("rejeita documento com mime type fora de PDF ou imagem", async () => {
    const service = new DocumentValidationService();

    const result = await service.validate(file("observacao.txt", "text/plain"));

    expect(result.accepted).toBe(false);
    expect(result.score).toBeLessThan(result.threshold);
    expect(result.reason).toContain("Formato nao aceito");
  });

  it("simula baixa confianca pelo nome do arquivo para testar rejeicao no upload", async () => {
    const service = new DocumentValidationService();

    const result = await service.validate(file("teste-baixo-score.pdf", "application/pdf"));

    expect(result).toMatchObject({
      accepted: false,
      score: 0.32,
      provider: "mock"
    });
  });
});
