import { Router } from "express";
import { LoginController } from "../controllers/sessions/login.controller.js";
import { LoginService } from "../services/sessions/login.service.js";

export const sessionsRoutes = Router();

const loginService = new LoginService();
const loginController = new LoginController(loginService);

sessionsRoutes.post("/sessions", (request, response) => {
  return loginController.handle(request, response);
});
