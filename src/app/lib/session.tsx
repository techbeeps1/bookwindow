// lib/session.ts
import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  password: "complex_password_at_least_32_characters_long",
  cookieName: "next_session",
  cookieOptions: {
    secure: true,
  },
};

export type SessionData = {
  count?: number;
  session_id?: string;
};

declare module "iron-session" {
  interface IronSessionData extends SessionData {}
}
