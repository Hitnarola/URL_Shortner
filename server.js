import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import userrouter from "./routes/user.routes.js";
import urlrouter from "./routes/url.routes.js";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

app.use(express.json());
app.use(authenticationMiddleware);
app.use(express.static(publicDir));
app.use("/user", userrouter);
app.use(urlrouter);

app.get("/", (req, res) => {
  return res.sendFile(path.join(publicDir, "index.html"));
});

export default app;
