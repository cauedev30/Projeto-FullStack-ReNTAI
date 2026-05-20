import { expect, Page, test } from "@playwright/test";

const solicitant = {
  email: "solicitante@rentai.local",
  password: "123456"
};

const specialist = {
  email: "especialista@rentai.local",
  password: "123456"
};

async function login(page: Page, email: string, password: string) {
  await page.goto("/");

  const loginForm = page.locator("form.auth-form").first();
  await loginForm.locator('input[name="email"]').fill(email);
  await loginForm.locator('input[name="password"]').fill(password);
  await loginForm.getByRole("button", { name: "Entrar", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

async function fillTeleconsultationForm(page: Page, patientName: string, documentName: string) {
  await page.locator('input[name="patientName"]').fill(patientName);
  await page.locator('input[name="patientBirthDate"]').fill("1985-05-18");
  await page.locator('select[name="specialty"]').selectOption("CARDIOLOGY");
  await page.locator('textarea[name="diagnosticHypothesis"]').fill("Hipotese cardiologica para teste E2E.");
  await page.locator('textarea[name="clinicalHistory"]').fill("Historia clinica resumida criada pelo teste E2E.");
  await page.locator('input[name="document"]').setInputFiles({
    name: documentName,
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% Documento sintetico para teste E2E\n")
  });
}

async function filterDashboardByPatient(page: Page, patientName: string) {
  const today = new Date().toISOString().slice(0, 10);

  await page.getByPlaceholder("Buscar por paciente ou especialidade").fill(patientName);
  await page.locator("form.toolbar select").selectOption("PENDING");
  await page.locator('form.toolbar input[type="date"]').nth(0).fill(today);
  await page.locator('form.toolbar input[type="date"]').nth(1).fill(today);
  await page.getByRole("button", { name: "Filtrar" }).click();

  const row = page.getByRole("row", { name: new RegExp(patientName) });
  await expect(row).toBeVisible();
  await expect(row.getByRole("cell", { name: "Cardiologia" })).toBeVisible();
  await expect(row.getByText("Pendente")).toBeVisible();
}

test("valida rejeicao, filtros e fluxo de parecer no navegador", async ({ page }) => {
  const suffix = Date.now();
  const rejectedPatient = `E2E Rejeicao ${suffix}`;
  const acceptedPatient = `E2E Aceito ${suffix}`;
  const opinion = `Parecer E2E registrado em ${suffix}.`;

  await login(page, solicitant.email, solicitant.password);

  await page.getByRole("link", { name: "Nova Teleconsultoria", exact: true }).click();
  await fillTeleconsultationForm(page, rejectedPatient, "teste-baixo-score.pdf");
  await page.getByRole("button", { name: "Enviar para validacao" }).click();

  await expect(page.getByText(/Documento rejeitado pela validacao inteligente\. Score: 0\.32\. Limiar: 0\.7\./)).toBeVisible();

  await fillTeleconsultationForm(page, acceptedPatient, "laudo-clinico.pdf");
  await page.getByRole("button", { name: "Enviar para validacao" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await filterDashboardByPatient(page, acceptedPatient);

  await page.getByRole("button", { name: "Sair" }).click();
  await login(page, specialist.email, specialist.password);

  await filterDashboardByPatient(page, acceptedPatient);
  await page.getByRole("row", { name: new RegExp(acceptedPatient) }).getByRole("link", { name: "Ver detalhes" }).click();

  await page.getByRole("button", { name: "Assumir caso" }).click();
  await expect(page.locator("span.status.IN_PROGRESS")).toHaveText("Em andamento");

  await page.locator('textarea[name="content"]').fill(opinion);
  await page.getByRole("button", { name: "Registrar Parecer" }).click();

  await expect(page.locator("span.status.COMPLETED")).toHaveText("Concluida");
  await expect(page.getByText(opinion)).toBeVisible();
});
