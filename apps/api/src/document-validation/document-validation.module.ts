import { Module } from "@nestjs/common";
import { DocumentValidationService } from "./document-validation.service";

@Module({
  providers: [DocumentValidationService],
  exports: [DocumentValidationService]
})
export class DocumentValidationModule {}
