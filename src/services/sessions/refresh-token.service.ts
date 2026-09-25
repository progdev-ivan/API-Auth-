import { prisma } from "../../lib/prisma.js";
import { PrismaClient } from "../../generated/prisma/client.js";
import bcrypt from "bcrypt";
import { AppError } from "../../errors/app-error.js";
import { TokenService } from "../tokens/token.service.js";
import { SessionService } from "./session.service.js";
import { RefreshTokenService as RefreshTokenGenerator } from "../tokens/refresh-token.service.js";

export class RefreshTokenService {
  constructor(
    private prismaClient: PrismaClient = prisma,
    private tokenService: TokenService = new TokenService(),
    private refreshTokenGenerator: RefreshTokenGenerator = new RefreshTokenGenerator(),
    private sessionService: SessionService = new SessionService(),
  ) { }

  async execute(refreshToken: string) {
    const parts = refreshToken.split(".");

    if (parts.length !== 2) {
      throw new AppError("Refresh token inválido", 401);
    }

    const [sessionId, secret] = parts;

    if (!sessionId || !secret) {
      throw new AppError("Refresh token inválido", 401);
    }

    const session = await this.prismaClient.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session) {
      throw new AppError("Refresh token inválido", 401);
    }

    const tokenMatches = await bcrypt.compare(
      secret,
      session.refreshTokenHash,
    );

    if (!tokenMatches) {
      throw new AppError("Refresh token inválido", 401);
    }

    if (session.expiresAt < new Date()) {
      throw new AppError("Refresh token expirado", 401);
    }

    const { secret: newSecret, secretHash: newSecretHash } =
      await this.refreshTokenGenerator.generate();

    await this.sessionService.updateRefreshTokenHash(
      session.id,
      newSecretHash,
    );

    const newRefreshToken = `${session.id}.${newSecret}`;

    const accessToken = this.tokenService.generateAccessToken(
      session.userId,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
