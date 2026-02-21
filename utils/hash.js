import { randomBytes, createHmac } from "crypto";

export function hashPasswordWithSalt(password, usersalt = undefined) {
  const salt = usersalt ?? randomBytes(256).toString("hex");
  const hashpass = createHmac("sha256", salt).update(password).digest("hex");

  return { salt, password: hashpass };
}

// in the utils we do the repeated work or code in one file
//utils = small reusable helper functions with no business rules and no DB access
