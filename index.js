import express from "express";
import userrouter from "./routes/user.routes.js";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";
const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(authenticationMiddleware);
app.use("/user", userrouter);
app.use("/", (req, res) => {
  return res.json({ status: "server is up and running" });
});
app.listen(PORT, () => console.log(`server is running on the port ${PORT}`));
