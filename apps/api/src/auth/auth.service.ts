import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Specialty, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaService } from "../database/prisma.service";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  specialty?: Specialty;
};

type LoginInput = {
  email: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(input: RegisterInput) {
    if (!input.name || !input.email || !input.password || !input.role) {
      throw new BadRequestException("Nome, email, senha e perfil sao obrigatorios.");
    }

    if (!Object.values(UserRole).includes(input.role)) {
      throw new BadRequestException("Perfil invalido.");
    }

    if (input.role === UserRole.SOLICITANT && input.specialty) {
      throw new BadRequestException("Solicitantes nao devem informar especialidade.");
    }

    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new BadRequestException("Ja existe usuario com este email.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        specialty: input.role === UserRole.SPECIALIST ? input.specialty ?? Specialty.CARDIOLOGY : null
      },
      select: { id: true, name: true, email: true, role: true, specialty: true }
    });

    return this.buildSession(user);
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new UnauthorizedException("Email ou senha invalidos.");
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException("Email ou senha invalidos.");
    }

    return this.buildSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: user.specialty
    });
  }

  private async buildSession(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    specialty: Specialty | null;
  }) {
    const accessToken = await this.jwtService.signAsync({ sub: user.id, role: user.role });
    return { accessToken, user };
  }
}
