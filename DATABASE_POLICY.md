# EasyPoints — Database & Connectivity Policy

> **Rule: ALWAYS use the live MongoDB Atlas database. NEVER use a local MongoDB instance or hardcoded data.**

---

## Live Database

| Setting               | Value                                    |
| --------------------- | ---------------------------------------- |
| **Provider**          | MongoDB Atlas                            |
| **Cluster**           | `easypoints.g77mr0h.mongodb.net`         |
| **Database**          | `easypoints`                             |
| **Connection String** | Stored in `server/.env` as `MONGODB_URI` |

The Atlas connection string is the **single source of truth**. The server **will crash on startup** if `MONGODB_URI` is not set — there is no localhost fallback.

---

## What's Enforced

### 1. Server — No Local DB Fallback

In `server/src/config/config.service.ts`, the `mongoUri` getter **throws an error** if `MONGODB_URI` is missing:

```typescript
get mongoUri(): string {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is required! ' +
      'Set it in server/.env to your MongoDB Atlas connection string. ' +
      'NEVER use a local MongoDB instance.'
    );
  }
  return process.env.MONGODB_URI;
}
```

> **Previously** it fell back to `mongodb://localhost:27017/easypoints` — that fallback has been **permanently removed**.

### 2. Mobile App — LAN IP for API

In `mobile/src/constants/index.ts`, the API URL uses your machine's LAN IP:

```typescript
const SERVER_IP = "192.168.1.8";
const SERVER_PORT = 3000;
export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/api`;
```

> **Previously** it used `localhost` / `10.0.2.2` which only work in emulators, not on real devices.

### 3. Server — Listens on 0.0.0.0

The server binds to `0.0.0.0` (all interfaces) so devices on the same WiFi network can reach it.

### 4. Seed Data → Atlas Only

The `SeedService` runs on startup and populates the Atlas database if empty. There is **no separate local seed script**.

---

## What You Must NEVER Do

| ❌ Don't                                        | ✅ Do Instead                          |
| ----------------------------------------------- | -------------------------------------- |
| Run `mongosh` against a local MongoDB           | Connect to Atlas via `server/.env` URI |
| Add `mongodb://localhost` anywhere              | Always use the `MONGODB_URI` env var   |
| Use `10.0.2.2` or `localhost` in mobile API URL | Use your machine's LAN IP              |
| Hardcode demo users/passwords in frontend       | All auth goes through the API → Atlas  |
| Drop the local DB expecting it affects the app  | The app only uses Atlas                |

---

## How to Update the Server IP (When WiFi Changes)

If your LAN IP changes (e.g., different network):

1. Find your new IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Update `mobile/src/constants/index.ts` → change `SERVER_IP`
3. Rebuild the APK: `cd mobile/android && ./gradlew assembleRelease`

---

## Demo Accounts (in Atlas)

| Name            | Email            | Password | Roles                |
| --------------- | ---------------- | -------- | -------------------- |
| Youssef Mohamed | youssef@demo.com | demo123  | member, staff, admin |
| Ahmed Hafez     | hafez@demo.com   | demo123  | member, staff        |
| Omar Farag      | farag@demo.com   | demo123  | member               |

These accounts are seeded into **Atlas** on first server start. They persist across restarts.

---

## APK Location

After building: `mobile/android/app/build/outputs/apk/release/app-release.apk`

**Important**: The APK requires the server to be running on the same WiFi network at the IP configured in `SERVER_IP`. Start the server before using the APK:

```bash
cd server && node dist/main.js
```
