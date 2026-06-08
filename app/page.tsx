import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Landing } from "@/components/landing/Landing";

export default async function Home() {
  const session = await auth();
  // Logged-in users skip the marketing landing and go straight to their projects.
  if (session?.user) redirect("/projetos");

  return <Landing />;
}
