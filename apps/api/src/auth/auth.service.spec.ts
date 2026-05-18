import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { Specialty, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  function makeService() {
    const prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn()
      }
    };
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue("token-assinado")
    };

    return {
      jwtService,
      prisma,
      service: new AuthService(prisma as never, jwtService as never)
    };
  }

  it("cadastra solicitante com token e sem especialidade", async () => {
    const { jwtService, prisma, service } = makeService();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: "user-1",
      name: "Solicitante APS",
      email: "solicitante@rentai.local",
      role: UserRole.SOLICITANT,
      specialty: null
    });

    const session = await service.register({
      name: "Solicitante APS",
      email: "solicitante@rentai.local",
      password: "123456",
      role: UserRole.SOLICITANT
    });

    expect(session).toEqual({
      accessToken: "token-assinado",
      user: {
        id: "user-1",
        name: "Solicitante APS",
        email: "solicitante@rentai.local",
        role: UserRole.SOLICITANT,
        specialty: null
      }
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: UserRole.SOLICITANT,
          specialty: null
        })
      })
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: "user-1", role: UserRole.SOLICITANT });
  });

  it("rejeita especialidade informada para solicitante", async () => {
    const { prisma, service } = makeService();

    await expect(
      service.register({
        name: "Solicitante APS",
        email: "solicitante@rentai.local",
        password: "123456",
        role: UserRole.SOLICITANT,
        specialty: Specialty.CARDIOLOGY
      })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("autentica usuario existente com senha valida", async () => {
    const { jwtService, prisma, service } = makeService();
    const passwordHash = await bcrypt.hash("123456", 4);
    jwtService.signAsync.mockResolvedValue("token-login");
    prisma.user.findUnique.mockResolvedValue({
      id: "specialist-1",
      name: "Especialista",
      email: "especialista@rentai.local",
      passwordHash,
      role: UserRole.SPECIALIST,
      specialty: Specialty.CARDIOLOGY
    });

    const session = await service.login({
      email: "especialista@rentai.local",
      password: "123456"
    });

    expect(session.accessToken).toBe("token-login");
    expect(session.user).toMatchObject({
      id: "specialist-1",
      role: UserRole.SPECIALIST,
      specialty: Specialty.CARDIOLOGY
    });
  });

  it("rejeita login com senha invalida", async () => {
    const { prisma, service } = makeService();
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "user@rentai.local",
      passwordHash: await bcrypt.hash("correta", 4)
    });

    await expect(service.login({ email: "user@rentai.local", password: "errada" })).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });
});
