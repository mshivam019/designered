import { getServerAuthSession } from "@/server/auth"
import { getServerSession } from "next-auth/next"

export async function getCurrentUser() {
  const session = await getServerAuthSession();

  return session?.user
}
