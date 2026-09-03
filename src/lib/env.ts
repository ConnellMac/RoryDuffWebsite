export function parseEnvironment(input: Record<string, string | undefined>) {
  const appUrl = new URL(input.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  if (!/^https?:$/.test(appUrl.protocol))
    throw new Error("NEXT_PUBLIC_APP_URL must use http or https.");
  const firebaseProjectId = input.FIREBASE_PROJECT_ID ?? "demo-sacred-path";
  if (!/^[a-z0-9-]{6,30}$/.test(firebaseProjectId)) throw new Error("Invalid FIREBASE_PROJECT_ID.");
  return { appUrl, firebaseProjectId };
}
