export function hasAllowedOrigin(request: Request) {
  const configured = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  const origin = request.headers.get("origin");
  return origin === configured.origin || origin === "http://127.0.0.1:3000";
}
