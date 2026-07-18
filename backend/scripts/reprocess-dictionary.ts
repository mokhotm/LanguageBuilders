import { db } from '../db';
import { dictionaryWords, englishLexicon } from '../schema';
import { eq, ilike, and, isNull, sql } from 'drizzle-orm';
import { coinWord } from '../morphology';

async function reprocessDictionary() {
  console.log('--- 🔄 REPROCESSING DICTIONARY & LEXICON ---');

  // 1. Auto-approve all existing dictionary entries that have a valid Sesotho translation
  const pendingWithTranslation = await db
    .select()
    .from(dictionaryWords)
    .where(eq(dictionaryWords.status, 'pending'));

  console.log(`Found ${pendingWithTranslation.length} pending entries with existing translations.`);

  let autoApprovedCount = 0;
  for (const word of pendingWithTranslation) {
    if (word.sesothoWord && word.sesothoWord.trim().length > 0) {
      await db
        .update(dictionaryWords)
        .set({ status: 'approved', approvedAt: new Date() })
        .where(eq(dictionaryWords.id, word.id));
      autoApprovedCount++;
    }
  }
  console.log(`✅ Auto-approved ${autoApprovedCount} existing entries.`);

  // 2. Fetch all unique English words in dictionary_words that are approved
  const existingApproved = await db
    .select({ englishWord: dictionaryWords.englishWord })
    .from(dictionaryWords)
    .where(eq(dictionaryWords.status, 'approved'));

  const approvedSet = new Set(existingApproved.map(w => w.englishWord.toLowerCase().trim()));
  console.log(`Total unique English terms with approved Sesotho translations: ${approvedSet.size}`);

  // 3. Fetch untranslated terms from english_lexicon
  const allLexicon = await db.select().from(englishLexicon);
  const untranslatedTerms = allLexicon.filter(item => !approvedSet.has(item.word.toLowerCase().trim()));

  console.log(`Found ${untranslatedTerms.length} untranslated English terms in lexicon.`);

  // 4. Batch process untranslated terms with the Coining Engine
  let newlyCoinedCount = 0;
  for (let i = 0; i < untranslatedTerms.length; i++) {
    const term = untranslatedTerms[i].word;
    console.log(`\n[${i + 1}/${untranslatedTerms.length}] Coining Sesotho translation for: "${term}"...`);

    try {
      const result = await coinWord(term);
      if (result && result.candidates && result.candidates.length > 0) {
        const topCandidate = result.candidates[0]; // Tier 1 or top-ranked native candidate

        const morphologyJson = JSON.stringify({
          prefix: topCandidate.prefix || null,
          root: topCandidate.root || topCandidate.sesothoWord,
          suffix: topCandidate.suffix || null,
          method: topCandidate.method,
          strategyTier: topCandidate.strategyTier,
          explanation: topCandidate.explanation,
          inspiration: topCandidate.inspiration || 'Bantu nominalization/compounding',
        });

        // Insert as approved
        await db.insert(dictionaryWords).values({
          englishWord: term,
          sesothoWord: topCandidate.sesothoWord,
          partOfSpeech: topCandidate.partOfSpeech || 'Noun',
          category: 'general',
          definition: topCandidate.definition || `Sesotho translation for "${term}".`,
          morphology: morphologyJson,
          status: 'approved',
          approvedAt: new Date(),
        });

        console.log(`   ✨ Coined & Approved: "${topCandidate.sesothoWord}" (${topCandidate.method})`);
        newlyCoinedCount++;
      }
    } catch (err: any) {
      console.error(`   ❌ Failed to coin for "${term}":`, err.message);
    }
  }

  console.log(`\n🎉 REPROCESSING COMPLETE!`);
  console.log(`- Auto-approved existing translations: ${autoApprovedCount}`);
  console.log(`- Newly coined & approved terms: ${newlyCoinedCount}`);

  process.exit(0);
}

reprocessDictionary().catch(err => {
  console.error('Fatal error during reprocessing:', err);
  process.exit(1);
});
