import db from "../db/index.js";
import { usertable } from "../model/user.model.js";
import { eq } from "drizzle-orm";

export async function getUserByEmail(email) {
  const [existinguser] = await db
    .select({
      id: usertable.id,
      firstname: usertable.firstname,
      lastname: usertable.lastname,
      email: usertable.email,
    })
    .from(usertable)
    .where(eq(usertable.email, email));

  return existinguser;
}

export async function createNewUser(
  firstname,
  lastname,
  email,
  hashpass,
  salt,
) {
  const [user] = await db
    .insert(usertable)
    .values({
      firstname,
      lastname,
      email,
      password: hashpass,
      salt,
    })
    .returning({ id: usertable.id });
  return user;
}

//in the services the we do the services provide the code write in this file
//services = business/use-case logic that talks to DB or external systems.
