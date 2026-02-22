import express from "express";
import "dotenv/config";
import { randomBytes } from "crypto";
import { OAuth2Client } from "google-auth-library";

import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
} from "../validation/req.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import {
  getUserByEmail,
  createNewUser,
  getUserById,
} from "../services/user.services.js";
import { createUserToken } from "../utils/token.js";
import { ensureAuthenticate } from "../middleware/auth.middleware.js";
import { hasDeliverableDomain } from "../utils/email.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post("/signup", async (req, res) => {
  const validationresult = await signupPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (validationresult.error) {
    return res.status(400).json({ error: validationresult.error.format() });
  }

  const { firstname, lastname, email, password } = validationresult.data;

  const isDeliverable = await hasDeliverableDomain(email);
  if (!isDeliverable) {
    return res
      .status(400)
      .json({ error: "please enter a valid email address" });
  }

  const existinguser = await getUserByEmail(email);
  if (existinguser)
    return res
      .status(400)
      .json({ error: `user with this email ${email} already exists ! ` });

  const { salt, password: hashpass } = hashPasswordWithSalt(password);
  const user = await createNewUser(firstname, lastname, email, hashpass, salt);

  return res.status(201).json({ data: { userId: user.id } });
});

router.post("/login", async (req, res) => {
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

  const token = await createUserToken({ id: user.id });
  return res.json({
    token,
    user: {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    },
  });
});

router.get("/google/config", async (_req, res) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || "").trim();

  return res.status(200).json({
    enabled: !!clientId,
    clientId,
  });
});

router.post("/google", async (req, res) => {
  const credential = String(req.body?.credential || "").trim();
  const clientId = (process.env.GOOGLE_CLIENT_ID || "").trim();

  if (!clientId) {
    return res
      .status(400)
      .json({ error: "GOOGLE_CLIENT_ID is not configured" });
  }

  if (!credential) {
    return res.status(400).json({ error: "google credential is required" });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    payload = ticket.getPayload();
  } catch (error) {
    return res.status(401).json({ error: "invalid google credential" });
  }

  const email = String(payload?.email || "")
    .trim()
    .toLowerCase();
  const fullName = String(payload?.name || "").trim();

  if (!email) {
    return res.status(400).json({ error: "google account email not found" });
  }

  let user = await getUserByEmail(email);

  if (!user) {
    const [firstnameRaw, ...lastnameParts] = fullName
      .split(" ")
      .filter(Boolean);
    const firstname = firstnameRaw || "Google";
    const lastname = lastnameParts.join(" ") || "User";

    const randomPassword = randomBytes(32).toString("hex");
    const { salt, password: hashpass } = hashPasswordWithSalt(randomPassword);

    const createdUser = await createNewUser(
      firstname,
      lastname,
      email,
      hashpass,
      salt,
    );

    user = {
      id: createdUser.id,
      firstname,
      lastname,
      email,
    };
  }

  const token = await createUserToken({ id: user.id });
  return res.status(200).json({
    token,
    user: {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    },
  });
});

router.get("/me", ensureAuthenticate, async (req, res) => {
  const user = await getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  const ownerEmail = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
  const isOwner = !!ownerEmail && user.email.toLowerCase() === ownerEmail;

  return res.status(200).json({ user, isOwner });
});
export default router;
