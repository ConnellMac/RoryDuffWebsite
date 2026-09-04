# Phase 2 authentication and authorization

Phase 2 uses Firebase Auth, Firestore, and Storage emulators only. No production project or credential is configured.

## Server authorization

After Firebase client authentication, `POST /api/auth/session` verifies a fresh ID token and verified-email claim with Firebase Admin, then sets a five-day `HttpOnly`, `SameSite=Lax` session cookie. Protected layouts re-verify the cookie with revocation checking. Member routes also require a completed profile; admin routes require the server-owned `super_admin` profile role. Firestore rules independently constrain direct client data access.

Onboarding is completed through `POST /api/onboarding`, not by treating a browser Firestore write as authorization state. The endpoint validates the verified server session and bounded profile input, writes the member-owned fields while fixing privileged defaults server-side, then reads the same document back through the same Admin Firestore instance. It returns success only when the canonical `onboarding: { state: "complete", version: 1 }` marker is visible. The member and admin guards use the same parser for that marker, and their layouts are force-dynamic.

## Local emulator admin

Run the emulators, then provide temporary values in the shell and execute `npm run admin:emulator`. The script refuses non-local emulator hosts and any project other than `demo-sacred-path`. It stores no password in the repository.

Required environment variables are `FIREBASE_PROJECT_ID=demo-sacred-path`, `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`, `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, `LOCAL_ADMIN_EMAIL`, and `LOCAL_ADMIN_PASSWORD` (at least 12 characters).

## Verification

```bash
npm run test:rules
npm run test:smoke
```

The smoke command starts Auth, Firestore, and Storage emulators around Playwright. The test retrieves only emulator-generated verification links; it never uses a live email provider.
