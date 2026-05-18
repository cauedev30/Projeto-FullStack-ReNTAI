import { Module } from "@nestjs/common";
import { DocumentValidationModule } from "../document-validation/document-validation.module";
import { TeleconsultationsController } from "./teleconsultations.controller";
import { TeleconsultationsGateway } from "./teleconsultations.gateway";
import { TeleconsultationsService } from "./teleconsultations.service";

@Module({
  imports: [DocumentValidationModule],
  controllers: [TeleconsultationsController],
  providers: [TeleconsultationsService, TeleconsultationsGateway]
})
export class TeleconsultationsModule {}
