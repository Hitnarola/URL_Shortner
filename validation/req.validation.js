//incoming request validation
import { z } from "zod";

export const signupPostRequestBodySchema = z.object({
  firstname: z.string().trim().min(1),
  lastname: z.string().trim().min(1).optional(),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(3),
});

export const loginPostRequestBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(3),
});

export const shortenPostRequestBodySchema = z.object({
  url: z.string().url(),
  code: z.string().optional(),
});
