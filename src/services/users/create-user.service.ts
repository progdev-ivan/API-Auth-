import { prisma } from "../../lib/prisma.js";
import { PrismaClient } from "../../generated/prisma/client.js";
import { AppError } from "../../errors/app-error.js";
import bcrypt from "bcrypt";

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export class CreateUserService {
  constructor(private prismaClient: PrismaClient = prisma) { }

  async execute({ name, email, password }: CreateUserRequest) {
    const userWithSameEmail = await this.prismaClient.user.findUnique({
      where: {
        email,
      },
    });

    if (userWithSameEmail) {
      throw new AppError("Email já cadastrado", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prismaClient.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
