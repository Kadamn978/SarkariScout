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

  // Auto-seed if SEED_DB=true (first deploy only)
  if (process.env.SEED_DB === 'true') {
    console.log('[Startup] SEED_DB=true — running seed script...');
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
  } else {
    console.log('[Startup] SEED_DB not set — skipping seed');
  }

  console.log('[Startup] Starting main application...');
  const child = spawn('node', ['dist/main.js'], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code));
}

main();
