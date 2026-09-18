import { PrismaClient } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import { AppError } from "../../errors/app-error.js";
import { TokenService } from "../tokens/token.service.js";

interface LoginRequest {
  email: string;
  password: string;
}

export class LoginService {
  constructor(
    private prismaClient: PrismaClient = prisma,
    private tokenService: TokenService = new TokenService(),
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

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }
}
