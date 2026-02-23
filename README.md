# 🔗 URL Shortener – Full-Stack Link Management Platform

[Live Project: https://url-shortner-sooty-delta.vercel.app/]

<p align="center">
	<img src="https://img.shields.io/badge/Node.js-Backend-green?logo=node.js" />
	<img src="https://img.shields.io/badge/Express-API-black?logo=express" />
	<img src="https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql" />
	<img src="https://img.shields.io/badge/Drizzle-ORM-c5f74f" />
	<img src="https://img.shields.io/badge/Bootstrap-UI-7952b3?logo=bootstrap" />
	<img src="https://img.shields.io/badge/TailwindCSS-UI-38bdf8?logo=tailwindcss" />
	<img src="https://img.shields.io/badge/Google-Sign--In-4285F4?logo=google" />
	<img src="https://img.shields.io/badge/License-ISC-yellow" />
</p>

---

## 🚀 Overview

**URL Shortener** is a modern full-stack web app to create, manage, and share short links.
It includes secure JWT authentication, custom short codes, a responsive dashboard UI, and an
**Owner Admin Dashboard** to view platform metrics and activity.

---

## 🆕 New Features

- 🧩 Enhanced frontend dashboard with user profile card and quick logout
- 🟢 Google Sign-In flow using Google Identity Services (`/user/google/config`, `/user/google`)
- 👑 Owner-only admin analytics panel with user counts, link counts, and latest URL activity
- 🪪 `GET /user/me` now returns `isOwner` to enable role-based UI rendering

---

## ✨ Features

### 👤 User

- 🔐 Email/password signup and login
- 🟢 Google Sign-In (login/signup via Google account)
- ✂️ Create short links from long URLs
- 🏷️ Optional custom short code while creating links
- 📋 View all your created links
- 🗑️ Delete your own links
- 📱 Responsive UI (Bootstrap + TailwindCSS)

### 🛠️ Owner/Admin

- 🧾 Owner-only dashboard visibility (based on `OWNER_EMAIL`)
- 📊 Platform summary: total users + total links
- 👥 User table with per-user link count
- 🕒 Recent links feed with owner email
- 🔒 Protected admin API (`/admin/overview`)

### ⚙️ Backend

- 🧠 REST API with Express
- 🗄️ PostgreSQL + Drizzle ORM
- 🔑 JWT auth middleware (`Authorization: Bearer <token>`)
- ✅ Input validation with Zod
- ↪️ Redirect short code to original target URL

---

## 🧰 Tech Stack

- **Backend:** Node.js, Express, PostgreSQL, Drizzle ORM, JWT, Zod
- **Frontend:** HTML, Bootstrap 5, TailwindCSS, Vanilla JavaScript
- **Auth:** Email/Password + Google Identity Services
- **Tools:** Docker Compose, PNPM, Drizzle Kit

---

## 🏁 Getting Started

### 1) Clone & Install

```bash
git clone <your-repo-url>
cd URL_Shortner
pnpm install
```

### 2) Run PostgreSQL (Docker)

```bash
docker compose up -d
```

### 3) Configure Environment

Create or update `.env`:

```env
DATABASE_URL=postgres://postgres:admin@localhost:5432/postgres
PORT=8000
JWT_SECRET=your_jwt_secret
OWNER_EMAIL=your_owner_email@example.com
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

> `GOOGLE_CLIENT_ID` is required only if you want Google Sign-In enabled.

### 4) Push Database Schema

```bash
pnpm db:push
```

### 5) Start App

```bash
pnpm dev
```

Open: **http://localhost:8000**

---

## ▲ Deploy on Vercel

### 1) Push code to GitHub

Make sure your latest changes are pushed to your repository.

### 2) Import Project in Vercel

- Go to Vercel Dashboard
- Click **Add New Project**
- Select this GitHub repository

### 3) Configure Project

- Framework Preset: **Other**
- Install Command: `pnpm install`
- Build Command: _(leave empty)_
- Output Directory: _(leave empty)_

### 4) Add Environment Variables

Set these in **Project Settings → Environment Variables**:

- `DATABASE_URL`
- `JWT_SECRET`
- `OWNER_EMAIL`
- `GOOGLE_CLIENT_ID` (optional if Google Sign-In is used)

> `PORT` is managed by Vercel automatically.

### 5) Run database schema push

Run this against your hosted PostgreSQL database:

```bash
pnpm db:push
```

### 6) Google OAuth production origin (if enabled)

Add your Vercel domain to Google OAuth **Authorized JavaScript origins**, for example:

- `https://your-project.vercel.app`

---

## 🔐 Google Sign-In Setup

1. Open Google Cloud Console: https://console.cloud.google.com/
2. Create OAuth Client ID (**Web application**)
3. Add Authorized JavaScript origin:
   - `http://localhost:8000`
4. Copy the generated Client ID into `.env` as `GOOGLE_CLIENT_ID`
5. Restart the app

---

## 🧑‍💻 API Endpoints

### Auth

- `POST /user/signup`
- `POST /user/login`
- `POST /user/google`
- `GET /user/google/config`
- `GET /user/me` (auth required)

### URL

- `POST /shorten` (auth required)
- `GET /codes` (auth required)
- `DELETE /:id` (auth required)
- `GET /:shortcode` (public redirect)

### Admin (Owner Only)

- `GET /admin/overview` (auth + owner email match)

---

## 📁 Folder Structure

```text
URL_Shortner/
├── api/
│   └── index.js
├── db/
├── middleware/
├── model/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── routes/
├── services/
├── utils/
├── validation/
├── docker-compose.yml
├── drizzle.config.js
├── index.js
├── package.json
├── server.js
├── vercel.json
└── README.md
```

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 📬 Contact

For support or contributions, please open an issue or pull request in this repository.
