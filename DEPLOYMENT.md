# 🚀 Stratega Deployment & Security Runbook

This guide covers the exact commands and configurations required to run a production build, push the code to GitHub, and deploy the Next.js App Router application securely to Vercel.

## 1. Local Production Build Check
Before deploying, ALWAYS verify that the application compiles without TypeScript or Webpack errors. Next.js does aggressive pre-rendering; if it cannot connect to the database or if your types are flawed, the build will fail.

```bash
# Clear any cached build files
rm -rf .next

# Run the strict compiler and bundler
npm run build
```

If the build succeeds, test the compiled production code locally:
```bash
npm run start
```
*Note: Your local `.env.local` must be fully populated for `npm run build` to succeed since Next.js often attempts to evaluate API routes at compile time.*

## 2. GitHub Source Control Setup
Create a new private repository on GitHub, then push the code securely:

```bash
# Initialize git if not already done
git init

# Add all project files (respecting .gitignore)
git add .

# Create the initial production commit
git commit -m "chore: initial production release"

# Link your private GitHub repository
git remote add origin https://github.com/YourUsername/Stratega.git

# Push to the main branch
git push -u origin main
```

## 3. Vercel Deployment Configuration
Vercel is natively optimized for Next.js and Serverless infrastructure.

1. **Import the Project:**
   - Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New...** > **Project**.
   - Import your newly pushed GitHub repository.

2. **Environment Variables:**
   Expand the *Environment Variables* section before hitting Deploy. You MUST add the following keys. Refer to `.env.example` to ensure exact spelling.
   - `MONGODB_URI`
   - `SESSION_SECRET`
   - `GEMINI_API_KEY`

3. **Deploy:**
   Click **Deploy**. Vercel will run `npm run build`. If you added your environment keys properly, this will succeed.

## 4. Serverless Timeout Configuration (Pro Tier Required)
Stratega contains AI processing routes (`/api/ai/summary/route.ts`) which use `export const maxDuration = 300;`. 

> **Important:** Vercel's Free/Hobby tier limits Serverless Functions to **10 seconds**, which will abruptly kill Gemini requests for large PDF summaries. You MUST be on the **Vercel Pro plan** to utilize the 300-second (5 minute) extended execution window.

## 5. Database Connection Whitelisting
Vercel serverless functions assign dynamic IP addresses. 
To ensure Vercel can talk to your database:
1. Open **MongoDB Atlas**.
2. Navigate to **Network Access**.
3. Add a new IP Address: `0.0.0.0/0` (Allow Access From Anywhere). 
   *Security Note:* Since `MONGODB_URI` contains a highly secure, randomized password, open IP whitelisting is the standard practice for serverless application backends.

## 6. Ongoing Monitoring
- Monitor Vercel's **Runtime Logs** dashboard to watch for IDOR intrusion attempts or Gemini API limit alerts.
- Watch your MongoDB connection pool size. Our `src/lib/dbConnect.ts` uses caching, but extremely high concurrent traffic scales the serverless pool.

You are now live. ⚡
