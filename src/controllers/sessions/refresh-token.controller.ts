import { Request, Response } from "express";
import { refreshTokenSchema } from "../../schemas/session.js";
import { RefreshTokenService } from "../../services/sessions/refresh-token.service.js";

export class RefreshTokenController {
  constructor(private refreshTokenService: RefreshTokenService) { }

  async handle(request: Request, response: Response) {
    const result = refreshTokenSchema.safeParse(request.body);

    if (!result.success) {
      return response.status(400).json({
        message: "Dados inválidos",
        errors: result.error.issues,
      });
    }

    const refreshToken = result.data.refreshToken;

    const token = await this.refreshTokenService.execute(refreshToken);

    return response.status(200).json(token);
  }
}
