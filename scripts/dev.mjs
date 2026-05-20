import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const processes = [
  { name: "api", args: ["run", "dev", "-w", "apps/api"] },
  { name: "web", args: ["run", "dev", "-w", "apps/web"] }
].map(({ name, args }) => {
  const child = spawn(npm, args, {
    stdio: "inherit",
    shell: false
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} finalizou com codigo ${code}.`);
    }
  });

  return child;
});

function stop() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on("SIGINT", () => {
  stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stop();
  process.exit(0);
});
