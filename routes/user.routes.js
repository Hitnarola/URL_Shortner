import express from "express";
import db from "../db/index.js";
import { usertable } from "../model/user.model.js";
const router = express.Router();
import { eq } from "drizzle-orm";

import { randomBytes, createHmac } from "crypto";

router.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const [existinguser] = await db
    .select({ id: usertable.id })
    .from(usertable)
    .where(eq(usertable.email, email));

  if (existinguser)
    return res
      .status(400)
      .json({ error: `user with this email ${email} already exists ! ` });

  const salt = randomBytes(256).toString("hex");
  const hashpass = createHmac("sha256", salt).update(password).digest("hex");

  const [user] = await db
    .insert(usertable)
    .valaues({
      firstname,
      lastname,
      email,
      password: hashpass,
      salt,
    })
    .returning({ id: usertable.id });

  return res.status(201).json({ data: { userId: user.id } });
});

export default router;
