// auth.ts — Auth.js (NextAuth v5) config: Google OAuth2 + MongoDB adapter.
// Database session strategy so user preferences (defaultModel, channel) stay
// authoritative in Mongo and fresh on every request.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClientPromise } from "@/lib/db/mongo-client";
import { DEFAULT_AI_MODEL, type AIModelId, type Channel } from "@/lib/types";

const useSecureCookies = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
  trustHost: true,
  cookies: {
    sessionToken: {
      // Explicit name so the edge guard (proxy.ts) checks the right cookie;
      // `__Secure-`/`secure` only in production (https), matching Auth.js defaults.
      name: `${useSecureCookies ? "__Secure-" : ""}offs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.defaultModel =
          (user as { defaultModel?: AIModelId }).defaultModel ?? DEFAULT_AI_MODEL;
        session.user.channel =
          (user as { channel?: Channel | null }).channel ?? null;
      }
      return session;
    },
  },
});
