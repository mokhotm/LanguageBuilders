import pg from 'pg';

const databaseUrl = 'postgresql://sqamtho:$qamth0%232025@localhost:5432/lbos';

async function run() {
  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS english_lexicon (
        id SERIAL PRIMARY KEY,
        word TEXT NOT NULL UNIQUE
      );
    `);
    console.log('Table english_lexicon created.');
  } finally {
    await client.end();
  }
}

run();
