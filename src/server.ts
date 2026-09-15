import "dotenv/config";
import express from "express";
import { errorHandler } from "./middlewares/error-handler.js";

import { usersRoutes } from "./routes/users.routes.js";

const app = express();

const PORT = 3333;

app.use(express.json());
app.use(usersRoutes);

app.get("/", (request, response) => {
  return response.json({ message: "Hello World" });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`⚡Server is running on http://localhost:${PORT}`);
});
