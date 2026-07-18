import { db } from '../db';
import { dictionaryWords } from '../schema';

async function checkCount() {
  const result = await db.select().from(dictionaryWords);
  console.log(`Total words in dictionary_words: ${result.length}`);
  const approved = result.filter(r => r.status === 'approved');
  console.log(`Approved words: ${approved.length}`);
  process.exit(0);
}

checkCount();
