# EasyPoints — Deploy to Vercel (100% Free, No Credit Card)

## Quick Deploy Steps

### 1. Push to GitHub (already done)

Repo: `https://github.com/Youssef-ElGhazaly/firsttech-hackathon-404-team-not-found`

### 2. Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. **Sign up with your GitHub account** — no credit card needed
3. Click **"Add New..."** → **"Project"**
4. Import the `firsttech-hackathon-404-team-not-found` repo
5. Configure:

| Setting            | Value    |
| ------------------ | -------- |
| **Root Directory** | `server` |
| **Framework**      | Other    |
| **Build Command**  | `npm run build` |
| **Output Directory** | (leave empty) |

6. Add **Environment Variables**:

| Variable      | Value                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI` | `mongodb+srv://easypoints:EasyPoints2026%21@easypoints.g77mr0h.mongodb.net/easypoints?retryWrites=true&w=majority&appName=EasyPoints` |
| `JWT_SECRET`  | `easypoints-hackathon-secret-2026`                                                                                                    |

7. Click **"Deploy"** — Vercel will build and deploy your serverless API

### 3. Get Your URL

Once deployed, your API will be live at:

```
https://easypoints-server.vercel.app/api
```

(The exact URL depends on your Vercel project name)

### 4. Test It

```bash
curl -s https://easypoints-server.vercel.app/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"youssef@demo.com","password":"demo123"}'
```

You should get back a JSON with `token` and `user`.

### 5. Install the APK

The APK is configured to use the Vercel URL. Install on any Android device:

```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

---

## Architecture

```
Phone (APK)  →  Vercel (Serverless NestJS)  →  MongoDB Atlas (Cloud DB)
   HTTPS           Free Hobby Plan               Free Tier (512MB)
```

- **Mobile app** → talks to `https://easypoints-server.vercel.app/api`
- **Vercel** → runs NestJS as serverless functions → connects to Atlas
- **MongoDB Atlas** → cloud database, already has all seed data

No local server needed. Works from anywhere with internet.

---

## Important Notes

### Why Vercel?

- **100% free** — no credit card required
- Auto-deploys on every `git push` to `main`
- Free SSL/HTTPS included
- Edge network for fast global responses

### Free Tier Details

- 100 GB bandwidth / month
- Serverless function execution: 100 GB-hours / month
- 10-second function timeout (more than enough for API calls)

### If the Vercel URL Changes

Update `mobile/src/constants/index.ts`:

```typescript
export const API_BASE_URL = 'https://YOUR-PROJECT-NAME.vercel.app/api';
```

Then rebuild: `cd mobile/android && ./gradlew assembleRelease`

### Local Development

To develop locally, update `mobile/src/constants/index.ts`:

```typescript
// PRODUCTION:
// export const API_BASE_URL = 'https://easypoints-server.vercel.app/api';

// LOCAL DEV:
const SERVER_IP = '192.168.1.8';
const SERVER_PORT = 3000;
export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/api`;
```

---

## Files for Deployment

| File                      | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `server/vercel.json`      | Vercel routing & build config              |
| `server/src/serverless.ts`| Serverless entry point (wraps NestJS app)  |
| `server/Dockerfile`       | (Legacy) Docker build for Render           |
| `render.yaml`             | (Legacy) Render config                     |
