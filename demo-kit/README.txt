Business demo quickstart (zip-safe)

How to run
- Unzip the folder on the target machine.
- Windows: double-click start-demo.ps1 (or run it in PowerShell).
- macOS/Linux: run ./start-demo.sh from Terminal.
- The scripts auto-install dependencies if node_modules is missing, then start the app on http://127.0.0.1:5000.

Notes
- Use Ctrl+Shift+R (or Cmd+Shift+R on macOS) to hard-refresh if icons look stale.
- If switching between Windows/macOS, delete node_modules before re-running to avoid cross-OS binaries.
- Headless/recording: from the app root, run npm run build && npm run preview -- --host 127.0.0.1 --port 5000.
