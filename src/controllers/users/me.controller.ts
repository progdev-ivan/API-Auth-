import { Request, Response } from "express";

import { AppError } from "../../errors/app-error.js";
import { GetUserService } from "../../services/users/get-user.service.js";

export class MeController {
  constructor(private getUserService: GetUserService) { }

  async handle(request: Request, response: Response) {
    const user = await this.getUserService.execute({
      userId: request.user.id,
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return response.json(user);
  }
}
