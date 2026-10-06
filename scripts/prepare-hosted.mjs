import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { spawnSync } from 'node:child_process';

// Import the current local roster, including verified employment and past companies.
// Credentials stay in ignored environment files and are never printed.
const sourceEnv = parse(readFileSync('.env'));
const targetEnv = parse(readFileSync(process.argv[2] ?? '.env.production.local'));
const sourceUrl = new URL(sourceEnv.DATABASE_URL);
const targetUrl = new URL(targetEnv.DATABASE_URL);
if (!['localhost', '127.0.0.1'].includes(sourceUrl.hostname) || !targetUrl.hostname.endsWith('.neon.tech'))
  throw new Error('Expected a local source and a managed Neon destination.');
if (!targetEnv.AUTH_SECRET) throw new Error('Configure the hosted authentication secret before preparing the database.');
const migrated = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
  env: { ...process.env, ...targetEnv }, stdio: 'inherit',
});
if (migrated.status !== 0) throw new Error('Hosted database migration failed.');
const source = new PrismaClient({ datasources: { db: { url: sourceEnv.DATABASE_URL } } });
const target = new PrismaClient({ datasources: { db: { url: targetEnv.DATABASE_URL } } });
try {
  const roster = await source.alumni.findMany();
  const imported = await target.alumni.createMany({ data: roster, skipDuplicates: true });
  const count = await target.alumni.count();
  console.log(`Hosted roster ready: ${count} alumni, ${imported.count} imported. Existing records preserved.`);
} finally {
  await Promise.all([source.$disconnect(), target.$disconnect()]);
}
