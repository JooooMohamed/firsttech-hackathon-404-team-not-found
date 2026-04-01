# EasyPoints — Deploy to Koyeb (100% Free, No Credit Card)

## Quick Deploy Steps

### 1. Push to GitHub (already done)

Repo: `https://github.com/Youssef-ElGhazaly/firsttech-hackathon-404-team-not-found`

### 2. Deploy on Koyeb

1. Go to [https://app.koyeb.com](https://app.koyeb.com)
2. **Sign up with your GitHub account** — no credit card needed
3. Click **"Create Web Service"**
4. Choose **"GitHub"** as the deployment method
5. Connect / authorize the `Youssef-ElGhazaly` GitHub account
6. Select the `firsttech-hackathon-404-team-not-found` repo
7. Configure the service:

| Setting             | Value                      |
| ------------------- | -------------------------- |
| **Builder**         | Dockerfile                 |
| **Dockerfile path** | `server/Dockerfile`        |
| **Work directory**  | `server`                   |
| **Service name**    | `easypoints-api`           |
| **Instance type**   | Free (nano)                |
| **Region**          | Washington, D.C. (closest) |
| **Port**            | `3000`                     |

8. Add **Environment Variables**:

| Variable      | Value                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI` | `mongodb+srv://easypoints:EasyPoints2026%21@easypoints.g77mr0h.mongodb.net/easypoints?retryWrites=true&w=majority&appName=EasyPoints` |
| `JWT_SECRET`  | `easypoints-hackathon-secret-2026`                                                                                                    |
| `PORT`        | `3000`                                                                                                                                |

9. Click **"Deploy"** — Koyeb will build your Docker image and deploy it

### 3. Get Your URL & Update the App

Once deployed, Koyeb gives you a URL like:

```
https://easypoints-api-<your-koyeb-username>.koyeb.app
```

Copy that URL, then update `mobile/src/constants/index.ts`:

```typescript
export const API_BASE_URL =
  "https://easypoints-api-YOUR_USERNAME.koyeb.app/api";
```

### 4. Test It

```bash
curl -s https://easypoints-api-YOUR_USERNAME.koyeb.app/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"youssef@demo.com","password":"demo123"}'
```

You should get back a JSON with `token` and `user`.

### 5. Rebuild the APK (after updating URL)

```bash
cd mobile/android && ./gradlew assembleRelease
```

Install: `mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## Architecture

```
Phone (APK)  →  Koyeb (NestJS API)  →  MongoDB Atlas (Cloud DB)
   HTTPS          Free nano              Free Tier (512MB)
```

- **Mobile app** → talks to `https://easypoints-api-xxx.koyeb.app/api`
- **Koyeb server** → reads `MONGODB_URI` env var → connects to Atlas
- **MongoDB Atlas** → cloud database, already has all seed data

No local server needed. Works from anywhere with internet.

---

## Important Notes

### Why Koyeb (Not Render)?

- Render free tier now **requires a credit card**
- Koyeb free tier is **truly free — no card needed**
- Both offer Docker deployments with GitHub integration

### Free Tier Details

- **1 free nano instance** (256 MB RAM, 0.1 vCPU)
- Always-on — **no cold starts** (unlike Render!)
- Auto-deploys on every `git push` to `main`
- Free SSL/HTTPS included

### Local Development

To develop locally, update `mobile/src/constants/index.ts`:

```typescript
// PRODUCTION:
// export const API_BASE_URL = 'https://easypoints-api-xxx.koyeb.app/api';

// LOCAL DEV:
const SERVER_IP = "192.168.1.8";
const SERVER_PORT = 3000;
export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/api`;
```

---

## Files for Deployment

| File                   | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `server/Dockerfile`    | Multi-stage Docker build for production        |
| `server/.dockerignore` | Excludes node_modules/dist from Docker context |
| `render.yaml`          | (Legacy) Render config — kept for reference    |
