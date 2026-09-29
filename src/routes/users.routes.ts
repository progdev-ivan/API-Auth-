import { Router } from "express";
import { CreateUserController } from "../controllers/users/create-user.controller.js";
import { CreateUserService } from "../services/users/create-user.service.js";

import { authMiddleware } from "../middlewares/auth.js";
import { MeController } from "../controllers/users/me.controller.js";
import { GetUserService } from "../services/users/get-user.service.js";

export const usersRoutes = Router();

const createUserService = new CreateUserService();
const createUserController = new CreateUserController(createUserService);

const getUserService = new GetUserService();
const meController = new MeController(getUserService);

usersRoutes.post("/users", (request, response) => {
  return createUserController.handle(request, response);
});

usersRoutes.get("/me", authMiddleware, (request, response) => {
  return meController.handle(request, response);
});
