import { Router } from "express";
import { CreateUserController } from "../controllers/users/create-user.controller.js";
import { CreateUserService } from "../services/users/create-user.service.js";

export const usersRoutes = Router();

const createUserService = new CreateUserService();
const createUserController = new CreateUserController(createUserService);

usersRoutes.post("/users", (request, response) => {
  return createUserController.handle(request, response);
});
