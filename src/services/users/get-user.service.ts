import { PrismaClient } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

interface GetUserRequest {
  userId: string;
}

export class GetUserService {
  constructor(private prismaClient: PrismaClient = prisma) { }

  async execute({ userId }: GetUserRequest) {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  }
}
