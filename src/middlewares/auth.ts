import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error.js";

export function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return response.status(401).json({
      message: "Token não informado",
    });
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return response.status(401).json({
      message: "Topken inválido",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET não configurado no ambiente", 500);
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || !decoded.sub) {
      return response.status(401).json({
        message: "Token inválido",
      });
    }

    request.user = {
      id: decoded.sub,
    };

    return next();
  } catch {
    return response.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}
