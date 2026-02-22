import express from "express";
import { shortenPostRequestBodySchema } from "../validation/req.validation.js";
import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import { urlsTable } from "../model/url.model.js";
import { usertable } from "../model/user.model.js";
import { ensureAuthenticate } from "../middleware/auth.middleware.js";
import { and, desc, eq } from "drizzle-orm";
import { getUserById } from "../services/user.services.js";
const router = express.Router();

router.get("/admin/overview", ensureAuthenticate, async (req, res) => {
  const currentUser = await getUserById(req.user.id);
  if (!currentUser) {
    return res.status(404).json({ error: "user not found" });
  }

  const ownerEmail = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
  if (!ownerEmail || currentUser.email.toLowerCase() !== ownerEmail) {
    return res.status(403).json({ error: "owner access required" });
  }

  const users = await db
    .select({
      id: usertable.id,
      firstname: usertable.firstname,
      lastname: usertable.lastname,
      email: usertable.email,
      createdAt: usertable.createdAt,
    })
    .from(usertable);

  const urls = await db
    .select({
      id: urlsTable.id,
      shortcode: urlsTable.shortcode,
      targetURL: urlsTable.targetURL,
      userId: urlsTable.userId,
      createdAt: urlsTable.createdAt,
    })
    .from(urlsTable);

  const recentUrls = await db
    .select({
      id: urlsTable.id,
      shortcode: urlsTable.shortcode,
      targetURL: urlsTable.targetURL,
      createdAt: urlsTable.createdAt,
      userEmail: usertable.email,
    })
    .from(urlsTable)
    .innerJoin(usertable, eq(urlsTable.userId, usertable.id))
    .orderBy(desc(urlsTable.createdAt))
    .limit(10);

  const linksByUserId = new Map();
  for (const item of urls) {
    linksByUserId.set(item.userId, (linksByUserId.get(item.userId) || 0) + 1);
  }

  const usersWithLinkCount = users.map((user) => ({
    ...user,
    totalLinks: linksByUserId.get(user.id) || 0,
  }));

  return res.status(200).json({
    summary: {
      totalUsers: users.length,
      totalLinks: urls.length,
      ownerEmail,
    },
    users: usersWithLinkCount,
    recentUrls,
  });
});

router.post("/shorten", ensureAuthenticate, async (req, res) => {
  const validateresult = await shortenPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (validateresult.error)
    return res.status(400).json({ error: validateresult.error.format() });

  const { url, code } = validateresult.data;

  const shortcode = code ?? nanoid(6);
  const [result] = await db
    .insert(urlsTable)
    .values({
      shortcode,
      targetURL: url,
      userId: req.user.id,
    })
    .returning({
      id: urlsTable.id,
      shortcode: urlsTable.shortcode,
      targetURL: urlsTable.targetURL,
    });
  return res.status(201).json({
    id: result.id,
    shortcode: result.shortcode,
    targetURL: result.targetURL,
  });
});

router.get("/codes", ensureAuthenticate, async (req, res) => {
  const code = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.userId, req.user.id));

  return res.status(200).json({ code });
});

router.delete("/:id", ensureAuthenticate, async (req, res) => {
  const id = req.params.id;
  await db
    .delete(urlsTable)
    .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

  return res.status(200).json({ delete: true });
});

router.get("/:shortcode", async (req, res) => {
  const code = req.params.shortcode;

  const [result] = await db
    .select({ targetURL: urlsTable.targetURL })
    .from(urlsTable)
    .where(eq(urlsTable.shortcode, code));

  if (!result) return res.status(404).json({ error: "invalid url" });

  return res.redirect(result.targetURL);
});
export default router;
