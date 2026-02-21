import express from "express";
import "dotenv/config";
import db from "../db/index.js";
import { usertable } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
} from "../validation/req.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { getUserByEmail, createNewUser } from "../services/user.services.js";

const router = express.Router();
router.post("/signup", async (req, res) => {
  const validationresult = await signupPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (validationresult.error) {
    return res.status(400).json({ error: validationresult.error.format() });
  }

  const { firstname, lastname, email, password } = validationresult.data;

  const existinguser = await getUserByEmail(email);
  if (existinguser)
    return res
      .status(400)
      .json({ error: `user with this email ${email} already exists ! ` });

  const { salt, password: hashpass } = hashPasswordWithSalt(password);
  const user = await createNewUser(firstname, lastname, email, hashpass, salt);

  return res.status(201).json({ data: { userId: user.id } });
});

router.get("/login", async (req, res) => {
  const validationresult = await loginPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (validationresult.error)
    return res.status(400).json({ error: validationresult.error.format() });

  const { email, password } = validationresult.data;

  const user = await getUserByEmail(email);
  if (!user)
    return res
      .status(400)
      .json({ error: `user with email ${email} not exists` });

  const { password: hashpass } = hashPasswordWithSalt(password, user.salt);

  if (user.password !== hashpass)
    return res.status(400).json({ error: "invalid password" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  return res.json({ token });
});
export default router;
