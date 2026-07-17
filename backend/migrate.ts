import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

async function migrate() {
  console.log('Running database migrations...');
  const client = new pg.Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database.');

    // 1. Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Checked "users" table.');

    // 2. Create dictionary_words table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dictionary_words (
        id SERIAL PRIMARY KEY,
        english_word TEXT NOT NULL,
        sesotho_word TEXT NOT NULL,
        part_of_speech TEXT NOT NULL,
        category TEXT NOT NULL,
        definition TEXT NOT NULL,
        morphology TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log('Checked "dictionary_words" table.');

    // 3. Create votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        word_id INTEGER NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
        vote_type TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Checked "votes" table.');

    // 4. Create unique index on votes(user_id, word_id)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS user_word_idx ON votes(user_id, word_id);
    `);
    console.log('Checked unique index on "votes" table.');

    // 5. Create english_lexicon table
    await client.query(`
      CREATE TABLE IF NOT EXISTS english_lexicon (
        id SERIAL PRIMARY KEY,
        word TEXT NOT NULL UNIQUE
      );
    `);
    console.log('Checked "english_lexicon" table.');

    console.log('Migrations completed successfully!');
  } catch (err: any) {
    console.error('Error running migrations:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
