import { NextRequest } from "next/server";

export const SESSION_COOKIE = "agent_session";

export function createSession(): string {
  return process.env.NEXTAUTH_SECRET ?? "dev-session-secret";
}

export function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get(SESSION_COOKIE);
  return !!cookie?.value && cookie.value === createSession();
}
