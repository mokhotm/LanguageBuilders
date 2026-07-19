import { db } from '../db';
import { dictionaryWords, englishLexicon } from '../schema';
import { eq, notInArray, sql } from 'drizzle-orm';
import { coinWord } from '../morphology';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function safePrint(str: string): string {
  if (!str) return '';
  return str.replace(/[^\x00-\x7F]/g, '').trim();
}

// Noise / non-standard word filter regex
const NOISE_REGEX = /^(a+h*|o+h*|e+h*|u+h*|mm+|z+|xx+|yy+|[0-9_]+)$/i;

async function runBatchAutoTranslate() {
  console.log('=== 🚀 STARTING BATCH AUTO-TRANSLATION WORKER ===\n');

  // Step 1: Build Set of already translated/approved English terms
  const existingWords = await db.select({ englishWord: dictionaryWords.englishWord }).from(dictionaryWords);
  const approvedSet = new Set<string>();
  for (const row of existingWords) {
    approvedSet.add(row.englishWord.toLowerCase().trim());
  }

  console.log(`Currently registered words in dictionary: ${approvedSet.size}`);

  // Step 2: Fetch untranslated candidate words from english_lexicon
  console.log('Querying English lexicon for high-frequency candidates...');
  const allLexicon = await db.select().from(englishLexicon);
  
  // Filter for clean, standard English words (length 3 to 12)
  const candidates = allLexicon
    .filter(item => {
      const w = item.word.toLowerCase().trim();
      return !approvedSet.has(w) && /^[a-z]{3,12}$/.test(w) && !NOISE_REGEX.test(w);
    });

  console.log(`Found ${candidates.length} untranslated English terms ready for batch processing.\n`);

  const BATCH_SIZE = 500; // Process in manageable batches
  const targetBatch = candidates.slice(0, BATCH_SIZE);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < targetBatch.length; i++) {
    const term = targetBatch[i].word.toLowerCase().trim();
    console.log(`[${i + 1}/${targetBatch.length}] Auto-translating: "${term}"...`);

    let retryDelay = 3000;
    let res = null;
    let attempts = 0;

    // Retry loop with exponential backoff for rate limits (HTTP 429)
    while (attempts < 3) {
      try {
        attempts++;
        res = await coinWord(term);
        break; // Success! Break retry loop
      } catch (err: any) {
        if (err.message && err.message.includes('429')) {
          console.log(`   ⚠️ Rate limit hit (429). Retrying in ${retryDelay / 1000}s (Attempt ${attempts}/3)...`);
          await sleep(retryDelay);
          retryDelay *= 2; // Exponential backoff
        } else {
          console.error(safePrint(`   ❌ Coining error for "${term}": ${err.message}`));
          break;
        }
      }
    }

    if (res && res.candidates && res.candidates.length > 0) {
      const topCandidate = res.candidates[0];

      // Reject non-native heuristic fallbacks or loanword fallbacks
      if (
        topCandidate.method === 'Loanword' ||
        topCandidate.sesothoWord.startsWith('matla') ||
        topCandidate.sesothoWord.toLowerCase() === term.toLowerCase()
      ) {
        console.log(`   ⏭️ Skipped non-native candidate for "${term}": ${topCandidate.sesothoWord}`);
        skippedCount++;
      } else {
        const morph = JSON.stringify({
          prefix: topCandidate.prefix || null,
          root: topCandidate.root || topCandidate.sesothoWord,
          suffix: topCandidate.suffix || null,
          method: topCandidate.method,
          strategyTier: topCandidate.strategyTier,
          explanation: topCandidate.explanation || '',
          inspiration: topCandidate.inspiration || 'Bantu nominalization/compounding',
        });

        try {
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

          approvedSet.add(term);
          console.log(safePrint(`   ✅ Approved: "${term}" -> "${topCandidate.sesothoWord}" (${topCandidate.method})`));
          successCount++;
        } catch (dbErr: any) {
          console.error(`   ❌ DB insert error for "${term}":`, dbErr.message);
          errorCount++;
        }
      }
    } else {
      errorCount++;
    }

    // Rate-limiting delay between terms
    await sleep(2500);
  }

  console.log('\n=== 🎉 BATCH TRANSLATION COMPLETED ===');
  console.log(`- Successfully translated & approved: ${successCount}`);
  console.log(`- Skipped non-native candidates: ${skippedCount}`);
  console.log(`- Errors / Rate limits: ${errorCount}`);
  console.log(`- Total dictionary coverage now: ${approvedSet.size} words`);

  process.exit(0);
}

runBatchAutoTranslate().catch(err => {
  console.error('Fatal batch worker error:', err);
  process.exit(1);
});
