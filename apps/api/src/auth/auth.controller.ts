import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthenticatedRequest } from "../common/request-user";
import { AuthGuard } from "../common/auth.guard";
import { AuthService } from "./auth.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() body: unknown) {
    return this.authService.register(body as never);
  }

  @Post("login")
  login(@Body() body: unknown) {
    return this.authService.login(body as never);
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return { user: request.user };
  }
}
