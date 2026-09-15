import { Request, Response } from "express";
import { CreateUserService } from "../../services/users/create-user.service.js";
import { createUserSchema } from "../../schemas/user.js";

export class CreateUserController {
  constructor(private createUserService: CreateUserService) { }

  async handle(request: Request, response: Response) {
    const result = createUserSchema.safeParse(request.body);

    if (!result.success) {
      return response.status(400).json({
        message: "Dados inválidos",
        errors: result.error.issues,
      });
    }

    const user = await this.createUserService.execute(result.data);

    return response.status(201).json(user);
  }
}
