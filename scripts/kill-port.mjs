#!/usr/bin/env node
/* eslint-env node */

import { exec } from "node:child_process";
import process from "node:process";

const portArg = process.argv[2] ?? process.env.PORT ?? "5000";
const port = Number.parseInt(portArg, 10);

if (!Number.isInteger(port)) {
  console.error(`Invalid port "${portArg}". Provide a numeric port.`);
  process.exit(1);
}

const run = (command) =>
  new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });

const killOnWindows = async () => {
  const { stdout } = await run(`netstat -ano | findstr :${port}`);

  if (!stdout.trim()) {
    console.log(`Port ${port} is already free.`);
    return;
  }

  const pids = Array.from(
    new Set(
      stdout
        .trim()
        .split(/\r?\n/)
        .map((line) => {
          const parts = line.trim().split(/\s+/);
          return parts[parts.length - 1];
        })
        .filter(Boolean),
    ),
  );

  if (!pids.length) {
    console.log(`Port ${port} is already free.`);
    return;
  }

  const { error, stderr } = await run(`taskkill /PID ${pids.join(" /PID ")} /F`);
  if (error) {
    throw new Error(stderr || error.message);
  }

  console.log(`Stopped processes ${pids.join(", ")} on port ${port}.`);
};

const killOnPosix = async () => {
  const { error: lsofError, stdout: lsofStdout } = await run(`lsof -ti tcp:${port}`);
  const lsofPids = lsofStdout
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (lsofPids.length) {
    const { error, stderr } = await run(`kill -9 ${lsofPids.join(" ")}`);
    if (error) {
      throw new Error(stderr || error.message);
    }

    console.log(`Stopped processes ${lsofPids.join(", ")} on port ${port}.`);
    return;
  }

  // If lsof is missing or came back empty, try fuser as a fallback.
  if (lsofError) {
    const { error: fuserError, stderr: fuserStderr } = await run(`fuser -k ${port}/tcp`);
    if (fuserError) {
      throw new Error(fuserStderr || fuserError.message);
    }

    console.log(`Used fuser to stop processes on port ${port}.`);
    return;
  }

  console.log(`Port ${port} is already free.`);
};

const main = async () => {
  try {
    if (process.platform === "win32") {
      await killOnWindows();
    } else {
      await killOnPosix();
    }
  } catch (err) {
    console.error(`Failed to free port ${port}: ${err.message}`);
    process.exit(1);
  }
};

main();
