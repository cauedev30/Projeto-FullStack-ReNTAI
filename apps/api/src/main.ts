import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
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
