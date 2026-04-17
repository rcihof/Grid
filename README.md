# Vertical AI Capability Map

Self-assessment tool for the Vertical team. Two tabs: a reference map of six AI capability domains with four levels each, and a personal assessment grid that saves to a unique URL.

## Deploy to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect the repo
4. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Node version:** 18+
5. Add a **Persistent Disk** (Render dashboard → your service → Disks):
   - Mount path: `/data`
   - Size: 1 GB (plenty)
6. Deploy

Each person gets a unique URL when they save. They can bookmark it and return from any device.

## Local dev

```bash
npm install
npm start
# → http://localhost:3000
```
