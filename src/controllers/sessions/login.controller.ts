import { Request, Response } from "express";
import { LoginService } from "../../services/sessions/login.service.js";
import { loginSchema } from "../../schemas/user.js";

export class LoginController {
  constructor(private loginService: LoginService) { }

  async handle(request: Request, response: Response) {
    const result = loginSchema.safeParse(request.body);

    if (!result.success) {
      return response.status(400).json({
        message: "Dados inválidos",
        errors: result.error.issues,
      });
    }

    const user = await this.loginService.execute(result.data);

    return response.status(200).json(user);
  }
}
