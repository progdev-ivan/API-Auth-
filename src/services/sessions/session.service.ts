import { prisma } from "../../lib/prisma.js";
import { PrismaClient } from "../../generated/prisma/client.js";

interface CreateSessionRequest {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export class SessionService {
  constructor(private prismaClient: PrismaClient = prisma) { }

  async create({
    id,
    userId,
    refreshTokenHash,
    expiresAt,
  }: CreateSessionRequest) {
    return this.prismaClient.session.create({
      data: {
        id,
        userId,
        refreshTokenHash,
        expiresAt,
      },
    });
  }

  async updateRefreshTokenHash(sessionId: string, refreshTokenHash: string) {
    return this.prismaClient.session.update({
      where: {
        id: sessionId,
      },
      data: {
        refreshTokenHash,
      }
    });
  }
}
