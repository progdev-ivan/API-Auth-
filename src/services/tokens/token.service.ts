import jwt from "jsonwebtoken";
import { AppError } from "../../errors/app-error.js";

export class TokenService {
  generateAccessToken(userId: string) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError("JWT_SECRET não configurado", 500);
    }

    return jwt.sign(
      {
        sub: userId,
      },
      secret,
      {
        expiresIn: "15m",
      },
    );
  }
}
