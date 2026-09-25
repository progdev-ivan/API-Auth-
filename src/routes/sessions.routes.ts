import { Router } from "express";
import { LoginController } from "../controllers/sessions/login.controller.js";
import { RefreshTokenController } from "../controllers/sessions/refresh-token.controller.js";
import { RefreshTokenService } from "../services/sessions/refresh-token.service.js";
import { LoginService } from "../services/sessions/login.service.js";

export const sessionsRoutes = Router();

const loginService = new LoginService();
const loginController = new LoginController(loginService);

const refreshTokenService = new RefreshTokenService();
const refreshTokenController = new RefreshTokenController(refreshTokenService);

sessionsRoutes.post("/sessions", (request, response) => {
  return loginController.handle(request, response);
});

sessionsRoutes.post("/sessions/refresh", (request, response) => {
  return refreshTokenController.handle(request, response);
});
