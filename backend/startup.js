const { execSync } = require('child_process');
const { spawn } = require('child_process');

async function main() {
  console.log('[Startup] Running prisma db push...');
  try {
    execSync('./node_modules/.bin/prisma db push --skip-generate --accept-data-loss', {
      stdio: 'inherit',
      timeout: 60000,
    });
    console.log('[Startup] Prisma db push completed successfully');
  } catch (e) {
    console.error('[Startup] Prisma db push failed:', e.message);
    console.error('[Startup] Continuing anyway...');
  }

  console.log('[Startup] Starting main application...');
  const child = spawn('node', ['dist/main.js'], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code));
}

main();
