const { execSync } = require('child_process');
const { spawn } = require('child_process');

async function main() {
  console.log('[Startup] Running prisma db push...');
  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      stdio: 'inherit',
      timeout: 60000,
    });
    console.log('[Startup] Prisma db push completed successfully');
  } catch (e) {
    console.error('[Startup] Prisma db push failed:', e.message);
    console.error('[Startup] Continuing anyway...');
  }

  // Auto-seed ONLY in development — never seed in production
  const isDev = process.env.NODE_ENV !== 'production';
  if (process.env.SEED_DB === 'true' && isDev) {
    console.log('[Startup] SEED_DB=true + NODE_ENV != production — running seed script...');
    try {
      execSync('node prisma/seed-plain.js', {
        stdio: 'inherit',
        timeout: 120000,
      });
      console.log('[Startup] Seed completed successfully');
    } catch (e) {
      console.error('[Startup] Seed failed:', e.message);
      console.error('[Startup] Continuing anyway...');
    }
  } else if (process.env.SEED_DB === 'true' && !isDev) {
    console.log('[Startup] SEED_DB=true but NODE_ENV=production — BLOCKED. Seed only runs in dev.');
  } else {
    console.log('[Startup] SEED_DB not set — skipping seed');
  }

  console.log('[Startup] Starting main application...');
  const child = spawn('node', ['dist/main.js'], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code));
}

main();
