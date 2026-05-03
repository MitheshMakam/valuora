# ◈ Valuora

> AI-powered e-commerce product analyzer. Paste any Amazon or Flipkart URL and get an instant **BUY / WAIT / AVOID** verdict powered by Claude claude-opus-4-5.

---

## ✅ Prerequisites

Install these once on your machine:

| Tool | Download |
|------|---------|
| **Node.js 18+** | https://nodejs.org (choose LTS) |
| **VS Code** | https://code.visualstudio.com |
| **Git** | https://git-scm.com |

---

## 🚀 Local Setup (VS Code)

### Step 1 — Open the project

```bash
# Option A: Unzip the downloaded file, then open the folder in VS Code
# File → Open Folder → select "valuora"

# Option B: From terminal
cd valuora
code .
```

### Step 2 — Get your FREE Gemini API Key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with your **Google account** (Gmail works)
3. Click **"Create API Key"**
4. Copy it — looks like `AIzaSy...`

> ✅ **Completely free** — 1,500 requests/day, no credit card needed

### Step 3 — Create your environment file

In VS Code, open the **Terminal** (`Ctrl+`` ` `` or Terminal → New Terminal) and run:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and replace the placeholder with your real key:

```env
GEMINI_API_KEY=AIzaSy-YOUR-REAL-KEY-HERE
```

> ⚠️ **Never share or commit `.env.local`** — it's already in `.gitignore`

### Step 4 — Install dependencies

```bash
npm install
```

This takes ~30 seconds the first time.

### Step 5 — Start the development server

```bash
npm run dev
```

You'll see:
```
▲ Next.js 14.x.x
- Local:   http://localhost:3000
- Ready in 1.2s
```

### Step 6 — Open the app

Visit **http://localhost:3000** in your browser 🎉

---

## 🌐 Deploy to Vercel (Free — takes 5 minutes)

### Option A — Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally (one-time)
npm install -g vercel

# Deploy from your project folder
vercel

# Follow the prompts:
# ✔ Set up and deploy? → Yes
# ✔ Which scope? → your-username
# ✔ Link to existing project? → No
# ✔ Project name? → valuora (or any name)
# ✔ Directory? → ./  (press Enter)
```

Then add your API key as a secret:

```bash
vercel env add GEMINI_API_KEY
# Paste your key when prompted
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

Your app is live at `https://valuora-xxxx.vercel.app` 🚀

---

### Option B — Via Vercel Dashboard (No CLI)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/valuora.git
   git push -u origin main
   ```

2. Go to **https://vercel.com** → **"Add New Project"**
3. Import your GitHub repo
4. Under **Environment Variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: `sk-ant-api03-...`
5. Click **Deploy**

Done! Every `git push` auto-deploys. 🎉

---

## 📁 Project Structure

```
valuora/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts        ← Secure API (your key stays server-side)
│   │   ├── globals.css             ← Global styles + dark/light theme
│   │   ├── layout.tsx              ← Root layout + fonts
│   │   └── page.tsx                ← Main page
│   ├── components/
│   │   ├── Header.tsx              ← Sticky header + theme toggle
│   │   ├── HeroSection.tsx         ← Landing headline
│   │   ├── InputSection.tsx        ← URL input + sample buttons
│   │   ├── LoadingState.tsx        ← Animated loading steps
│   │   ├── ErrorBox.tsx            ← Error display
│   │   └── ResultsDashboard.tsx    ← Full results UI
│   └── lib/
│       ├── types.ts                ← TypeScript interfaces
│       └── utils.ts                ← URL detection helpers
├── .env.local.example              ← Copy this to .env.local
├── .gitignore                      ← .env.local is excluded
├── next.config.js
├── package.json
├── tsconfig.json
└── vercel.json                     ← Vercel deploy config
```

---

## 🔧 VS Code Extensions (Recommended)

Install these for the best experience:

- **ESLint** — `dbaeumer.vscode-eslint`
- **Prettier** — `esbenp.prettier-vscode`
- **Tailwind CSS IntelliSense** — `bradlc.vscode-tailwindcss`
- **TypeScript Hero** — `rbbit.typescript-hero`

Open Extensions panel: `Ctrl+Shift+X`

---

## 🛠️ Available Scripts

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Build for production
npm run start    # Run production build locally
npm run lint     # Check for code issues
```

---

## 🌍 Supported Platforms

| Platform | URL Pattern |
|----------|-------------|
| Amazon India | amazon.in |
| Amazon US | amazon.com |
| Amazon UK | amazon.co.uk |
| Flipkart | flipkart.com |
| Myntra | myntra.com |
| Snapdeal | snapdeal.com |
| Meesho | meesho.com |

---

## ❓ Troubleshooting

| Problem | Fix |
|---------|-----|
| `GEMINI_API_KEY` not found | Make sure `.env.local` exists with your key |
| Port 3000 in use | Run `npm run dev -- -p 3001` |
| `npm install` fails | Try `npm install --legacy-peer-deps` |
| Blank page | Open browser console (F12) and check for errors |
| API returns 429 | Rate limit hit — wait 1 minute |

---

## 🔐 Security Notes

- Your API key **never reaches the browser** — all calls go through `/api/analyze`
- Rate limiting: 10 requests/minute per IP (built-in)
- URL validation: only supported e-commerce domains are accepted

---

Built with ❤️ using Next.js 14 + Gemini 2.0 Flash (Free)
