import jwt from "jsonwebtoken";
import "dotenv/config";

import { userTokenSchema } from "../validation/token.validation.js";

export async function createUserToken(payload) {
  const validateresult = await userTokenSchema.safeParseAsync(payload);

  if (validateresult.error) {
    return res.status(400).json({ error: validateresult.error.format() });
  }
  const payloadValidatedData = validateresult.data;
  const token = jwt.sign(payloadValidatedData, process.env.JWT_SECRET);
  return token;
}
