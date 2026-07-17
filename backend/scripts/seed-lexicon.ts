import fs from 'fs';
import wordListPath from 'word-list';
import { db } from '../db.js';
import { englishLexicon } from '../schema.js';

async function seedLexicon() {
  console.log('Loading English words from word-list package...');
  // The word-list package returns a file path to the list of words.
  const wordsString = fs.readFileSync(wordListPath, 'utf8');
  const words = wordsString.split('\n').filter(Boolean);
  
  console.log(`Found ${words.length} words. Preparing to insert...`);

  // Empty the table first
  await db.delete(englishLexicon);
  
  // Insert in batches
  const batchSize = 10000;
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize).map(w => ({ word: w.trim() }));
    console.log(`Inserting batch ${i / batchSize + 1} of ${Math.ceil(words.length / batchSize)}...`);
    await db.insert(englishLexicon).values(batch).onConflictDoNothing();
  }

  console.log('Successfully seeded englishLexicon table!');
  process.exit(0);
}

seedLexicon().catch(err => {
  console.error('Error seeding lexicon:', err);
  process.exit(1);
});
