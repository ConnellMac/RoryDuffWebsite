import { NextResponse } from "next/server";

import { InvalidInput } from "@/src/lib/validation/values";

export function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

export function apiError(error: unknown) {
  if (error instanceof InvalidInput) return noStoreJson({ error: error.message }, 400);
  if (error instanceof SyntaxError) return noStoreJson({ error: "Malformed JSON." }, 400);
  return noStoreJson({ error: "Unable to complete the request." }, 500);
}
