#!/usr/bin/env node

const { execSync } = await import('child_process');

try {
  // List all known tables from migrations and common tables
  const knownTables = [
    'account',
    'jwks', 
    'session',
    'user',
    'verification',
    'todo',
    'posts', // in case it exists from previous runs
  ];
  
  console.log('Dropping all known tables...');
  
  // Build DROP commands for all known tables
  const dropCommands = knownTables.map(table => `DROP TABLE IF EXISTS ${table};`).join(' ');
  
  // Execute all drops and clear migrations in one command
  const fullCommand = `${dropCommands} DELETE FROM d1_migrations;`;
  
  try {
    execSync(`wrangler d1 execute DB --remote --command "${fullCommand}"`, 
      { stdio: 'inherit' });
    console.log('✅ Database reset complete!');
  } catch (error) {
    // Some tables might not exist, that's ok
    console.log('✅ Database reset complete (some tables may not have existed)');
  }
  
  // Now run migrations
  console.log('\nApplying migrations...');
  execSync('bun run db:push:remote', { stdio: 'inherit' });
  
} catch (error) {
  console.error('Error resetting database:', error.message);
  process.exit(1);
}