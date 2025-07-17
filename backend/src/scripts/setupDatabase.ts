import { createTables } from '../utils/dbUtils';

async function main() {
  try {
    await createTables();
    console.log('Database setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Database setup failed:', err);
    process.exit(1);
  }
}

main();