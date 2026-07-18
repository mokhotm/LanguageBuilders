import { db } from '../db';
import { dictionaryWords, englishLexicon } from '../schema';
import { eq, and, like } from 'drizzle-orm';
import { coinWord } from '../morphology';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function safePrint(str: string): string {
  if (!str) return '';
  return str.replace(/[^\x00-\x7F]/g, '').trim();
}

// Priority list of high-frequency everyday, academic, and STEM English words
const PRIORITY_ENGLISH_WORDS = [
  'motion', 'atom', 'cell', 'base', 'acid', 'element', 'compound', 'reaction',
  'system', 'process', 'network', 'data', 'code', 'logic', 'function', 'variable',
  'equation', 'matrix', 'vector', 'ratio', 'percentage', 'frequency'
];

async function resolveObviousWords() {
  console.log('--- 🚀 RESOLVING OBVIOUS & HIGH-PRIORITY ENGLISH WORDS ---');

  // Step 0: Clean up any heuristic fallback entries from previous 429 runs
  await db.delete(dictionaryWords).where(like(dictionaryWords.sesothoWord, 'matla%'));

  // Step 1: Expand multi-word English definitions in dictionary_words into individual words
  console.log('\n[Step 1] Expanding multi-term English entries...');
  const existingWords = await db.select().from(dictionaryWords);
  console.log(`Analyzing ${existingWords.length} existing dictionary records...`);

  const approvedSet = new Set<string>();
  for (const row of existingWords) {
    if (row.status === 'approved') {
      approvedSet.add(row.englishWord.toLowerCase().trim());
    }
  }

  const newRecordsToInsert: any[] = [];
  for (const row of existingWords) {
    if (row.status === 'approved') {
      const cleanEng = row.englishWord.toLowerCase().trim();
      if (cleanEng.includes(',') || cleanEng.includes(';')) {
        const terms = cleanEng.split(/[,;]+/).map(t => t.trim()).filter(t => t.length > 1 && !t.includes(' '));
        for (const term of terms) {
          if (!approvedSet.has(term)) {
            approvedSet.add(term);
            newRecordsToInsert.push({
              englishWord: term,
              sesothoWord: row.sesothoWord,
              partOfSpeech: row.partOfSpeech || 'Noun',
              category: row.category || 'general',
              definition: row.definition || `Sesotho translation for "${term}".`,
              morphology: row.morphology || '{}',
              status: 'approved',
              approvedAt: new Date()
            });
          }
        }
      }
    }
  }

  if (newRecordsToInsert.length > 0) {
    console.log(`Bulk inserting ${newRecordsToInsert.length} expanded single-term entries...`);
    for (let i = 0; i < newRecordsToInsert.length; i += 500) {
      const chunk = newRecordsToInsert.slice(i, i + 500);
      await db.insert(dictionaryWords).values(chunk);
    }
    console.log(`Expanded ${newRecordsToInsert.length} individual term entries into dictionary!`);
  } else {
    console.log(`All multi-term entries already expanded.`);
  }

  // Step 2: Identify priority English terms missing an approved Sesotho translation
  console.log('\n[Step 2] Identifying missing high-priority English terms...');
  const missingPriorityTerms = PRIORITY_ENGLISH_WORDS.filter(term => !approvedSet.has(term.toLowerCase()));

  console.log(`Found ${missingPriorityTerms.length} high-priority English terms needing resolution.`);

  // Step 3: Batch-coin and auto-approve priority candidates with rate limiting
  let coinedCount = 0;
  for (let i = 0; i < missingPriorityTerms.length; i++) {
    const term = missingPriorityTerms[i];
    console.log(`\n[${i + 1}/${missingPriorityTerms.length}] Synthesizing native Sesotho term for: "${term}"...`);

    try {
      const res = await coinWord(term);
      if (res && res.candidates && res.candidates.length > 0) {
        const topCandidate = res.candidates[0];

        // Ensure we don't save loanwords or heuristic fallbacks if fallback occurred
        if (topCandidate.method === 'Loanword' || topCandidate.sesothoWord.startsWith('matla')) {
          console.log(`   Skipping non-native candidate for "${term}": ${topCandidate.sesothoWord}`);
          continue;
        }

        const morph = JSON.stringify({
          prefix: topCandidate.prefix || null,
          root: topCandidate.root || topCandidate.sesothoWord,
          suffix: topCandidate.suffix || null,
          method: topCandidate.method,
          strategyTier: topCandidate.strategyTier,
          explanation: topCandidate.explanation || '',
          inspiration: topCandidate.inspiration || 'Bantu nominalization/compounding',
        });

        await db.insert(dictionaryWords).values({
          englishWord: term,
          sesothoWord: topCandidate.sesothoWord,
          partOfSpeech: topCandidate.partOfSpeech || 'Noun',
          category: 'general',
          definition: topCandidate.definition || `Sesotho translation for "${term}".`,
          morphology: morph,
          status: 'approved',
          approvedAt: new Date()
        });

        console.log(safePrint(`   Approved: "${term}" -> "${topCandidate.sesothoWord}" (${topCandidate.method})`));
        coinedCount++;
      }
    } catch (err: any) {
      console.error(safePrint(`   Failed for "${term}": ${err.message}`));
    }

    // Rate limiting delay between API calls to prevent 429
    await sleep(3500);
  }

  console.log('\nRESOLUTION COMPLETE!');
  console.log(`- Expanded term entries: ${newRecordsToInsert.length}`);
  console.log(`- Newly coined priority terms: ${coinedCount}`);

  process.exit(0);
}

resolveObviousWords().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
