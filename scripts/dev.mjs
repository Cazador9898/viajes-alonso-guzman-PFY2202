/** Inicia Vite y API mock de una vez, compatible con Windows/Linux. */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const api = spawn(process.execPath, ['server/mock-api.mjs'], { cwd: root, stdio: 'inherit' });
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0'], { cwd: root, stdio: 'inherit' });
const processes = [api, vite];
let closing = false;
const shutdown = () => {
  if (closing) return;
  closing = true;
  for (const child of processes) if (child.exitCode === null && !child.killed) child.kill();
};
for (const child of processes) {
  child.on('error', (error) => { console.error('Error al iniciar getiomark:', error.message); shutdown(); process.exitCode = 1; });
  child.on('exit', (code) => { if (!closing && code !== 0) { shutdown(); process.exitCode = code ?? 1; } });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
