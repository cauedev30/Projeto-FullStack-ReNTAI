import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { DocumentValidationModule } from "./document-validation/document-validation.module";
import { TeleconsultationsModule } from "./teleconsultations/teleconsultations.module";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? "development-secret",
      signOptions: { expiresIn: "8h" }
    }),
    DatabaseModule,
    AuthModule,
    DocumentValidationModule,
    TeleconsultationsModule
  ]
})
export class AppModule {}
