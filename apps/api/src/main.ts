import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { existsSync, readFileSync } from "node:fs";
import { AppModule } from "./app.module";

function loadLocalEnv() {
  if (!existsSync(".env")) return;

  const lines = readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}

async function bootstrap() {
  loadLocalEnv();

  const app = await NestFactory.create(AppModule);
  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

  app.enableCors({
    origin: webOrigin,
    credentials: true
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("ReNTAI Teleconsultoria API")
    .setDescription("API para modulo de teleconsultoria com validacao inteligente de documentos.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = Number(process.env.PORT ?? 3333);
  await app.listen(port);
}

bootstrap();
