import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env
const envPath = path.resolve(__dirname, '../.env');
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match) {
    databaseUrl = match[1];
  }
}

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL not found in .env or environment');
  process.exit(1);
}

console.log('⚡ Connecting to Neon PostgreSQL database...');
const sql = neon(databaseUrl);

async function run() {
  try {
    const schemaPath = path.resolve(__dirname, '../neon-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Creating database tables...');
    // Split and execute SQL statements
    const statements = schemaSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await sql.query(statement);
    }

    console.log('✅ All tables and indexes created successfully in Neon DB!');

    // Test query
    const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
    console.log('📋 Existing tables in Neon:');
    console.log(res.map((r) => `  - ${r.table_name}`).join('\n'));

    console.log('\n🎉 Neon Database is completely set up and ready!');
  } catch (err) {
    console.error('❌ Database setup failed:', err);
    process.exit(1);
  }
}

run();
