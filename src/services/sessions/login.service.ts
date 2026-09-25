import { PrismaClient } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { AppError } from "../../errors/app-error.js";
import { TokenService } from "../tokens/token.service.js";
import { RefreshTokenService } from "../tokens/refresh-token.service.js";
import { SessionService } from "./session.service.js";

interface LoginRequest {
  email: string;
  password: string;
}

export class LoginService {
  constructor(
    private prismaClient: PrismaClient = prisma,
    private tokenService: TokenService = new TokenService(),
    private refreshTokenService: RefreshTokenService = new RefreshTokenService(),
    private sessionService: SessionService = new SessionService(),
  ) { }

  async execute({ email, password }: LoginRequest) {
    const user = await this.prismaClient.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new AppError("E-mail ou senha inválidos", 401);
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppError("E-mail ou senha inválidos", 401);
    }

    const accessToken = this.tokenService.generateAccessToken(user.id);

    const { secret, secretHash } =
      await this.refreshTokenService.generate();

    const sessionId = crypto.randomUUID();

    const refreshToken = `${sessionId}.${secret}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);

    await this.sessionService.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: secretHash,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }
}
