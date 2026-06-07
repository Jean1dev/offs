import type { DefaultSession } from "next-auth";
import type { AIModelId, Channel } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      defaultModel: AIModelId;
      channel: Channel | null;
    } & DefaultSession["user"];
  }

  interface User {
    defaultModel?: AIModelId;
    channel?: Channel | null;
  }
}
