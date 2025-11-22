# ✨ Welcome to Your Spark Template!
You've just launched your brand-new Spark Template Codespace — everything’s fired up and ready for you to explore, build, and create with Spark!

This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

🚀 What's Inside?
- A clean, minimal Spark environment
- Pre-configured for local development
- Ready to scale with your ideas
  
🧠 What Can You Do?

Right now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

🧹 Just Exploring?
No problem! If you were just checking things out and don’t need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## Running locally with or without Spark

- Install deps: `npm install`, then `npm run dev`.
- The app will try `/_spark/kv` and `/_spark/user` on startup. If reachable, it uses the live Spark runtime.
- If those endpoints are unreachable (or you set `VITE_SPARK_MODE=mock`), it falls back to an in-browser KV mock and stub user so demos work offline.
- Mock KV data is stored in `localStorage` under `spark-kv-mock`; clear it to reset demo state.

## Windows quickstart

- Free the dev port if something is already running: `npm run kill -- 5000` (uses netstat/taskkill under the hood).
- Start the app from PowerShell: `npm install` then `npm run dev -- --host 127.0.0.1 --port 5000`.
- For the packaged demo, run `demo-kit/start-demo.ps1` which installs deps if needed and launches on port 5000.
