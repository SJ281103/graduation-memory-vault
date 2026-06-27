# 🎓 Graduation Memory Vault
### A premium, full-stack website to preserve graduation memories forever.

---

## 📁 Project Structure

```
graduation-memory-vault/
├── frontend/                  ← Next.js 14 app (deploy to Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                  ← Landing page
│   │   │   ├── layout.tsx                ← Root layout + fonts
│   │   │   ├── submit/page.tsx           ← Friend memory form (5 steps)
│   │   │   ├── submit/teacher/page.tsx   ← Teacher form
│   │   │   ├── memories/page.tsx         ← Memory wall (masonry)
│   │   │   ├── gallery/page.tsx          ← Photo/video gallery
│   │   │   ├── admin/page.tsx            ← Admin dashboard
│   │   │   └── admin/login/page.tsx      ← Admin login
│   │   ├── components/
│   │   │   ├── layout/Navbar.tsx
│   │   │   ├── animations/FloatingParticles.tsx
│   │   │   └── ui/ (StatsBar, GuestbookSection, TimeCapsuleSection)
│   │   ├── lib/api.ts                    ← All API calls (axios)
│   │   └── styles/globals.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── .env.example
│
└── backend/                   ← Node.js + Express (deploy to Render)
    ├── server.js              ← Entry point
    ├── models/
    │   ├── Admin.js
    │   ├── FriendMemory.js
    │   ├── TeacherMemory.js
    │   └── extras.js          ← TimeCapsule + Guestbook
    ├── routes/
    │   ├── auth.js, memories.js, teachers.js
    │   ├── media.js, guestbook.js, timeCapsule.js, admin.js
    ├── middleware/auth.js
    ├── config/cloudinary.js
    └── .env.example
```

---

## 🔧 PREREQUISITES

Install these tools before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | comes with Node.js |
| Git | latest | https://git-scm.com |

You also need **free accounts** on:
- **MongoDB Atlas** — https://mongodb.com/atlas (database)
- **Cloudinary** — https://cloudinary.com (image/video storage)
- **Vercel** — https://vercel.com (frontend hosting)
- **Render** — https://render.com (backend hosting)

---

## ⚙️ PART 1 — EXTERNAL SERVICES SETUP

### 1A. MongoDB Atlas Setup

1. Go to https://mongodb.com/atlas and sign up (free)
2. Click **"Build a Database"** → Choose **Free tier (M0)**
3. Choose a cloud provider (AWS is fine) and a region close to you
4. Click **"Create"**
5. Set up a database user:
   - Username: `vaultadmin` (or any name)
   - Password: Create a strong password and **save it**
6. On "Network Access" → Click **"Add IP Address"** → **"Allow Access from Anywhere"** (`0.0.0.0/0`)
7. Go to **"Clusters"** → Click **"Connect"** → **"Compass"** or **"Drivers"**
8. Choose **Node.js**, copy the connection string. It looks like:
   ```
   mongodb+srv://vaultadmin:yourpassword@cluster0.xxxxx.mongodb.net/
   ```
9. Your final URI (add the db name):
   ```
   mongodb+srv://vaultadmin:yourpassword@cluster0.xxxxx.mongodb.net/graduation-vault?retryWrites=true&w=majority
   ```
   **Save this string — you need it for the backend `.env`**

---

### 1B. Cloudinary Setup

1. Go to https://cloudinary.com and sign up (free)
2. On your dashboard, find:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (a number like `1234567890123456`)
   - **API Secret** (a long string, click the eye icon to reveal)
3. **Save all three** — you need them for the backend `.env`

---

## 💻 PART 2 — LOCAL DEVELOPMENT SETUP

### Step 1 — Download the project

If you received this as a ZIP, extract it. Or clone from GitHub:

```bash
git clone https://github.com/yourusername/graduation-memory-vault.git
cd graduation-memory-vault
```

---

### Step 2 — Backend Setup

```bash
# Enter the backend folder
cd backend

# Install all packages
npm install

# Create your environment file
cp .env.example .env
```

Now open `backend/.env` in any text editor (VS Code, Notepad, etc.) and fill in your values:

```env
PORT=5000
NODE_ENV=development

# Paste your MongoDB Atlas URI here
MONGODB_URI=mongodb+srv://vaultadmin:yourpassword@cluster0.xxxxx.mongodb.net/graduation-vault?retryWrites=true&w=majority

# Make up a long secret (min 32 chars, anything random)
JWT_SECRET=my_super_secret_graduation_vault_key_2024_xyz

# From your Cloudinary dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=1234567890123456
CLOUDINARY_API_SECRET=your_api_secret_here

# Your frontend URL (for local dev, keep as below)
FRONTEND_URL=http://localhost:3000
```

**Start the backend:**

```bash
# Install nodemon globally for auto-restart
npm install -g nodemon

# Start in development mode
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

Test it by visiting: http://localhost:5000/health
You should see: `{"status":"ok","timestamp":"..."}`

---

### Step 3 — Create Admin Account

The very first thing to do is create your admin account. Open a new terminal and run:

```bash
curl -X POST http://localhost:5000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStrongPassword123!","name":"Your Name"}'
```

**Windows (use PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/setup" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"YourStrongPassword123!","name":"Your Name"}'
```

You should see: `{"message":"Admin account created successfully"}`

> ⚠️ This endpoint only works ONCE. After that it returns 403 (admin already exists).

---

### Step 4 — Frontend Setup

Open a **new terminal** (keep the backend running):

```bash
# Go to frontend folder (from project root)
cd frontend

# Install all packages
npm install

# Create your environment file
cp .env.example .env.local
```

Open `frontend/.env.local` and set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start the frontend:**

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.5
- Local: http://localhost:3000
```

---

### Step 5 — View the Website Locally

Open your browser:

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Submit Memory | http://localhost:3000/submit |
| Teacher Form | http://localhost:3000/submit/teacher |
| Memory Wall | http://localhost:3000/memories |
| Gallery | http://localhost:3000/gallery |
| Admin Login | http://localhost:3000/admin/login |
| Admin Dashboard | http://localhost:3000/admin |

Login with the credentials you set in Step 3.

---

## 🚀 PART 3 — DEPLOYMENT (FREE HOSTING)

### Step 6 — Deploy Backend to Render

1. Go to https://render.com and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select the `graduation-memory-vault` repository
   - If not on GitHub, click **"Public Git Repository"** and paste your repo URL
4. Configure:
   - **Name:** `graduation-memory-vault-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
5. Click **"Advanced"** → **"Add Environment Variable"** and add ALL your backend env variables:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your full MongoDB URI |
| `JWT_SECRET` | your secret key |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |
| `FRONTEND_URL` | (fill this after Vercel deploy, for now: `https://yourapp.vercel.app`) |

6. Click **"Create Web Service"**
7. Wait 2-5 minutes for it to build and deploy
8. Your backend URL will be something like:
   ```
   https://graduation-memory-vault-api.onrender.com
   ```
   Copy this URL — you need it for the frontend.

9. **Test your backend:** Visit `https://graduation-memory-vault-api.onrender.com/health`
   Should return: `{"status":"ok",...}`

10. **Create admin on production:**
    ```bash
    curl -X POST https://graduation-memory-vault-api.onrender.com/api/auth/setup \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"YourStrongPassword123!","name":"Your Name"}'
    ```

---

### Step 7 — Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up (free, use GitHub login)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
5. Add Environment Variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://graduation-memory-vault-api.onrender.com/api` |

6. Click **"Deploy"**
7. Wait 1-3 minutes
8. Your site will be live at something like:
   ```
   https://graduation-memory-vault.vercel.app
   ```

---

### Step 8 — Connect Frontend ↔ Backend (Final Step)

1. Copy your Vercel URL (e.g., `https://graduation-memory-vault.vercel.app`)
2. Go to your **Render dashboard** → Select your backend service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Vercel URL
5. Click **"Save Changes"** — Render will auto-redeploy

Your site is now **fully connected and live!** 🎉

---

## 🔗 SHARING THE LINK

Share your Vercel URL with all your classmates and teachers:

```
https://graduation-memory-vault.vercel.app
```

- **Friends** → click "Leave a Memory"
- **Teachers** → click "Leave Memory" → there's a "Teachers Section" link on the form page

All submissions go to "pending" in your admin dashboard. You must approve them for them to appear publicly.

---

## 🔐 ADMIN WORKFLOW

1. Visit `/admin/login` and login
2. Go to **Friends** tab — approve/reject/feature submissions
3. Go to **Teachers** tab — approve teacher messages
4. Go to **Capsules** tab — approve time capsule entries
5. Use **Export** to download all data as JSON
6. **Featured** memories appear in the "Hall of Legends" section

---

## 🌟 FEATURES CHECKLIST

| Feature | Status | Location |
|---------|--------|----------|
| Landing page with hero | ✅ | `/` |
| Floating gold particles | ✅ | All pages |
| Days since graduation counter | ✅ | Hero section |
| Animated quote rotator | ✅ | Hero section |
| Background music toggle | ✅ | Hero section |
| Friend memory form (5 steps) | ✅ | `/submit` |
| Signature/doodle pad | ✅ | Submit step 4 |
| Photo upload | ✅ | Submit step 2 |
| Teacher's section | ✅ | `/submit/teacher` |
| Memory wall (masonry) | ✅ | `/memories` |
| Like system | ✅ | Memory cards |
| Comment system | ✅ | Memory modal |
| Hall of Legends (featured) | ✅ | Memory wall → "Featured" tab |
| Photo/video gallery | ✅ | `/gallery` |
| Slideshow mode | ✅ | Gallery page |
| Download photos | ✅ | Gallery lightbox |
| Guestbook | ✅ | Memory wall → "Guestbook" tab |
| Time Capsule | ✅ | Memory wall → "Time Capsule" tab |
| Admin dashboard | ✅ | `/admin` |
| Approve/reject/feature | ✅ | Admin → Friends tab |
| Analytics | ✅ | Admin overview |
| Export all data (JSON) | ✅ | Admin sidebar |
| Confetti on submission | ✅ | After submit |
| Mobile responsive | ✅ | All pages |
| Rate limiting | ✅ | Backend |
| JWT authentication | ✅ | Admin routes |
| File upload protection | ✅ | Cloudinary |

---

## 🛠️ COMMON ISSUES & FIXES

**"MongoDB connection failed"**
- Check your URI is correct in `.env`
- Make sure you whitelisted `0.0.0.0/0` in MongoDB Atlas Network Access
- Make sure username/password in the URI has no special characters (URL-encode them if needed)

**"CORS error" in browser**
- Make sure `FRONTEND_URL` in your backend `.env` matches exactly the URL your frontend runs on
- For local dev: `http://localhost:3000` (no trailing slash)
- For production: `https://yourapp.vercel.app` (no trailing slash)

**"Images not uploading"**
- Double-check all three Cloudinary values in backend `.env`
- Make sure your Cloudinary account is active (free tier supports uploads)

**"Admin login says invalid credentials"**
- You may not have run the `/api/auth/setup` step
- Re-run the curl command from Step 3

**Render free tier is slow on first request**
- Free tier services on Render "sleep" after 15 min of inactivity
- First request after sleep takes ~30 seconds to "wake up"
- Upgrade to Starter plan ($7/month) to avoid this

**Frontend shows "Network Error"**
- Make sure `NEXT_PUBLIC_API_URL` in Vercel points to your live Render URL
- Rebuild/redeploy on Vercel after changing env variables

---

## 📊 DATABASE COLLECTIONS

After people start submitting, these MongoDB collections are created automatically:

| Collection | Description |
|------------|-------------|
| `admins` | Your admin account |
| `friendmemories` | All friend submissions |
| `teachermemories` | All teacher submissions |
| `timecapsules` | Time capsule messages |
| `guestbooks` | Guestbook signatures |

---

## 🎨 CUSTOMIZATION

**Change the graduation date:**
Open `frontend/src/app/page.tsx` and change:
```js
const GRADUATION_DATE = new Date('2024-05-15'); // ← your actual date
```

**Change the college/class name:**
Search for "Class of 2024" and "Computer Science Engineering" across all files and replace with your details.

**Change the hero background photo:**
In `frontend/src/app/page.tsx`, find the Unsplash URL in the hero section and replace with your own image URL.

**Change colors:**
All colors are in `frontend/tailwind.config.js` under `theme.extend.colors`.

**Add custom music:**
Replace the audio source URL in `frontend/src/app/page.tsx`:
```jsx
<source src="YOUR_PIANO_MUSIC_URL.mp3" type="audio/mp3" />
```
Use royalty-free music from https://pixabay.com/music/

---

## 📦 TECH STACK SUMMARY

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, React Hook Form, React Confetti, React Signature Canvas, React Dropzone, React Hot Toast, React Masonry CSS, date-fns, Zustand, Axios

**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT (jsonwebtoken), bcryptjs, Cloudinary SDK, Multer, express-rate-limit, express-validator, Helmet, Morgan, CORS

**Services:** MongoDB Atlas (DB), Cloudinary (media), Vercel (frontend hosting), Render (backend hosting)

---

## 🙏 FINAL NOTES

- All memories are stored **permanently** in your MongoDB Atlas database
- Photos/videos are stored permanently on **Cloudinary**
- The admin approval system protects against spam
- Time capsules automatically unlock on the set date
- The site is mobile-first and works beautifully on all devices

**Share the link. Collect the memories. Cherish them forever.** 🎓✨
