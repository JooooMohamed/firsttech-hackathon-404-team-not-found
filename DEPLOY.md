# EasyPoints — Deploy to Render (Free)

## Quick Deploy Steps

### 1. Push to GitHub

```bash
cd /Users/youssefelghzaly/Developer/EasyPoints
git init
git add .
git commit -m "EasyPoints MVP — ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/EasyPoints.git
git push -u origin main
```

### 2. Deploy on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Sign up / log in with your **GitHub account**
3. Click **"New +"** → **"Blueprint"**
4. Connect your `EasyPoints` GitHub repo
5. Render will auto-detect `render.yaml` and create the service
6. **Set the environment variables** when prompted:

| Variable      | Value                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI` | `mongodb+srv://easypoints:EasyPoints2026%21@easypoints.g77mr0h.mongodb.net/easypoints?retryWrites=true&w=majority&appName=EasyPoints` |
| `JWT_SECRET`  | `easypoints-hackathon-secret-2026`                                                                                                    |

7. Click **"Apply"** — Render will build and deploy your server

### 3. Verify It Works

Once deployed, your API will be live at:

```
https://easypoints-api.onrender.com/api
```

Test login:

```bash
curl -s https://easypoints-api.onrender.com/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"youssef@demo.com","password":"demo123"}'
```

You should get back a JSON with `token` and `user`.

### 4. Install the APK

The APK is already configured to use the Render URL. Install it on any Android device:

```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

---

## Architecture

```
Phone (APK)  →  Render (NestJS API)  →  MongoDB Atlas (Cloud DB)
   HTTPS            Free Tier              Free Tier (512MB)
```

- **Mobile app** → talks to `https://easypoints-api.onrender.com/api`
- **Render server** → reads `MONGODB_URI` env var → connects to Atlas
- **MongoDB Atlas** → cloud database, already has all seed data

No local server needed. Works from anywhere with internet.

---

## Important Notes

### Free Tier Limitations

- Render free tier **spins down after 15 min of inactivity**
- First request after spin-down takes ~30-60 seconds (cold start)
- After that, responses are fast until next idle period

### If the Render URL Changes

If you rename the service, update `mobile/src/constants/index.ts`:

```typescript
export const API_BASE_URL = "https://YOUR-NEW-NAME.onrender.com/api";
```

Then rebuild: `cd mobile/android && ./gradlew assembleRelease`

### Local Development

To develop locally, uncomment the local URL in `mobile/src/constants/index.ts`:

```typescript
// PRODUCTION:
// export const API_BASE_URL = 'https://easypoints-api.onrender.com/api';

// LOCAL DEV:
const SERVER_IP = "192.168.1.8";
const SERVER_PORT = 3000;
export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/api`;
```

---

## Files Added for Deployment

| File                   | Purpose                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `render.yaml`          | Render Infrastructure as Code — auto-configures the service |
| `server/Dockerfile`    | Multi-stage Docker build for production                     |
| `server/.dockerignore` | Excludes node_modules/dist from Docker context              |
