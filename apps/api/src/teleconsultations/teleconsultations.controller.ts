import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { mkdirSync } from "node:fs";
import { Response } from "express";
import { diskStorage } from "multer";
import { AuthGuard } from "../common/auth.guard";
import { AuthenticatedRequest } from "../common/request-user";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { TeleconsultationsService } from "./teleconsultations.service";

@ApiTags("teleconsultations")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("teleconsultations")
export class TeleconsultationsController {
  constructor(private readonly service: TeleconsultationsService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query() query: never) {
    return this.service.list(request.user, query);
  }

  @Post()
  @Roles(UserRole.SOLICITANT)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("document", {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
          mkdirSync(uploadDir, { recursive: true });
          callback(null, uploadDir);
        },
        filename: (_request, file, callback) => {
          const safeBase = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
          callback(null, `${Date.now()}-${safeBase}`);
        }
      })
    })
  )
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: never,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.service.create(request.user, body, file);
  }

  @Get(":id")
  detail(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.service.detail(request.user, id);
  }

  @Post(":id/assign")
  @Roles(UserRole.SPECIALIST)
  assign(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.service.assign(request.user, id);
  }

  @Post(":id/opinions")
  @Roles(UserRole.SPECIALIST)
  registerOpinion(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body("content") content: string
  ) {
    return this.service.registerOpinion(request.user, id, content);
  }

  @Get(":id/export.pdf")
  @Header("Content-Type", "application/pdf")
  async exportPdf(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Res() response: Response
  ) {
    const pdf = await this.service.buildPdf(request.user, id);
    response.setHeader("Content-Disposition", `attachment; filename=\"teleconsultoria-${id}.pdf\"`);
    response.send(pdf);
  }
}
