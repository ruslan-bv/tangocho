import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const DB_NAME = 'tangocho';

async function checkPostgresRunning(): Promise<boolean> {
  try {
    await execAsync('pg_isready -q');
    return true;
  } catch {
    return false;
  }
}

async function startPostgres(): Promise<boolean> {
  console.log('Starting PostgreSQL...');

  // Try brew services first (most common on macOS)
  try {
    await execAsync('brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null');
    // Wait for PostgreSQL to be ready
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (await checkPostgresRunning()) {
        return true;
      }
    }
  } catch {
    // Try pg_ctl as fallback
    try {
      const { stdout } = await execAsync('brew --prefix postgresql@14 2>/dev/null || brew --prefix postgresql 2>/dev/null');
      const pgDir = stdout.trim();
      await execAsync(`${pgDir}/bin/pg_ctl -D ${pgDir}/var/postgres start -l ${pgDir}/var/postgres/server.log`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await checkPostgresRunning();
    } catch {
      return false;
    }
  }

  return false;
}

async function checkDatabaseExists(): Promise<boolean> {
  try {
    await execAsync(`psql -lqt | cut -d \\| -f 1 | grep -qw ${DB_NAME}`);
    return true;
  } catch {
    return false;
  }
}

async function createDatabase(): Promise<void> {
  await execAsync(`createdb ${DB_NAME}`);
}

async function main() {
  console.log('Checking PostgreSQL...\n');

  // Check if PostgreSQL is running
  const pgRunning = await checkPostgresRunning();

  if (!pgRunning) {
    console.log('PostgreSQL is not running');

    const started = await startPostgres();
    if (!started) {
      console.error('\nFailed to start PostgreSQL automatically.\n');
      console.error('Please start it manually:');
      console.error('  brew services start postgresql');
      console.error('  Or: pg_ctl -D /usr/local/var/postgres start\n');
      process.exit(1);
    }

    console.log('PostgreSQL started');
  } else {
    console.log('PostgreSQL is running');
  }

  // Check if database exists
  const dbExists = await checkDatabaseExists();
  if (!dbExists) {
    console.log(`Database "${DB_NAME}" not found, creating...`);
    try {
      await createDatabase();
      console.log(`Database "${DB_NAME}" created`);
    } catch (error) {
      console.error(`Failed to create database: ${error}`);
      process.exit(1);
    }
  } else {
    console.log(`Database "${DB_NAME}" exists`);
  }

  console.log('\nReady!\n');
}

main();
