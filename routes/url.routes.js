import express from "express";
import { shortenPostRequestBodySchema } from "../validation/req.validation.js";
import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import { urlsTable } from "../model/url.model.js";
import { ensureAuthenticate } from "../middleware/auth.middleware.js";
import { eq } from "drizzle-orm";
const router = express.Router();

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

router.get("/:shortcode", async (req, res) => {
  const code = req.params.shortcode;

  const [result] = await db
    .select({ targetURL: urlsTable.targetURL })
    .from(urlsTable)
    .where(eq(urlsTable.shortcode, code));

  if (!result) return res.status(404).json({ error: "invalid url" });

  return res.redirect(result.targetURL);
});

router.ger('/')
export default router;
