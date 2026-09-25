import crypto from "node:crypto";
import bcrypt from "bcrypt";

export class RefreshTokenService {
  async generate() {
    const secret = crypto.randomBytes(64).toString("hex");

    const secretHash = await bcrypt.hash(secret, 12);

    return {
      secret,
      secretHash,
    };
  }
}
