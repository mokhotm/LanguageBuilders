import fs from 'fs';
import { db } from '../db.js';
import { users, dictionaryWords } from '../schema.js';
import { eq } from 'drizzle-orm';

const filePath = 'c:\\Ezzy\\Projects\\LanguageBuilders\\artifacts\\Bukantswe Sesotho-English Bilingual Dictionary\\Data.RMA.Bukantswe-Sesotho-English-Bilingual.txt';

// Sanitization helper to remove control characters and unsupported encoding sequences (e.g. U+0080 to U+009F)
function sanitizeText(str: string): string {
  if (!str) return '';
  // Remove control characters and non-printable sequences
  return str.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '').trim();
}

async function importBukantswe() {
  console.log('Reading Bukantswe dictionary file...');
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(Boolean);
  console.log(`Found ${lines.length} lines in file.`);

  // 1. Get moderator user ID
  let creatorId = 1;
  try {
    const moderator = await db.query.users.findFirst({
      where: eq(users.username, 'moderator')
    });
    if (moderator) {
      creatorId = moderator.id;
      console.log(`Using moderator user ID: ${creatorId}`);
    } else {
      console.log('Moderator user not found, defaulting to user ID 1');
    }
  } catch (err) {
    console.log('Database query failed, defaulting to user ID 1:', err);
  }

  // 2. Parse entries
  const wordsToInsert: any[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length < 2) continue;

    const sesotho = sanitizeText(parts[0]);
    const englishDef = sanitizeText(parts[1]);

    if (!sesotho || !englishDef) continue;

    // Parse Part of Speech
    let pos = 'Noun';
    if (englishDef.includes('(v.)')) pos = 'Verb';
    else if (englishDef.includes('(adj.)')) pos = 'Adjective';
    else if (englishDef.includes('(adv.)')) pos = 'Adverb';
    else if (englishDef.includes('(prep.)')) pos = 'Preposition';
    else if (englishDef.includes('(n.)')) pos = 'Noun';

    // Clean English word
    const englishWord = englishDef
      .replace(/\(v\.\)/g, '')
      .replace(/\(adj\.\)/g, '')
      .replace(/\(adv\.\)/g, '')
      .replace(/\(prep\.\)/g, '')
      .replace(/\(n\.\)/g, '')
      .replace(/<Eng/gi, '')
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!englishWord) continue;

    // Auto-classify STEM category
    let category: 'mathematics' | 'biology' | 'physics' | 'chemistry' | 'computer_science' | 'general' = 'general';
    const lowerEng = englishWord.toLowerCase();
    if (lowerEng.match(/(algebra|geometry|isometry|number|math|equation|calculate|multiply|divide|add|subtract|matrix|fraction)/)) {
      category = 'mathematics';
    } else if (lowerEng.match(/(physics|velocity|gravity|speed|electron|force|energy|watt|joule|mass|acceleration|electricity|voltage|magnet)/)) {
      category = 'physics';
    } else if (lowerEng.match(/(chemistry|acid|alkaline|element|atom|molecule|gas|oxygen|hydrogen|chemical|reaction)/)) {
      category = 'chemistry';
    } else if (lowerEng.match(/(biology|plant|animal|life|virus|bacteria|cell|organism|anatomy|flower)/)) {
      category = 'biology';
    } else if (lowerEng.match(/(computer|software|hardware|network|data|digital|code|internet|screen|keyboard)/)) {
      category = 'computer_science';
    }

    wordsToInsert.push({
      englishWord,
      sesothoWord: sesotho,
      partOfSpeech: pos,
      category,
      definition: englishDef,
      morphology: JSON.stringify({
        method: category !== 'general' ? 'Semantic Calque' : 'Semantic Extension',
        explanation: 'Imported from Bukantswe Sesotho-English Bilingual Dictionary'
      }),
      status: 'approved',
      createdBy: creatorId,
      approvedBy: creatorId,
      approvedAt: new Date()
    });
  }

  console.log(`Parsed ${wordsToInsert.length} valid entries. Seeding to database...`);

  // Setting pg client encoding to UTF8 to avoid translation errors
  try {
    await db.execute(sql`SET client_encoding TO 'UTF8'`);
    console.log('Set database client encoding to UTF8.');
  } catch (encErr) {
    console.log('Failed to set client_encoding to UTF8, continuing with default:', encErr);
  }

  // Clear previous Bukantswe imports (optional, to avoid duplicate duplicates)
  // Let's delete existing imported Bukantswe words
  try {
    const deleted = await db.delete(dictionaryWords).where(
      eq(dictionaryWords.morphology, JSON.stringify({
        method: 'Semantic Extension',
        explanation: 'Imported from Bukantswe Sesotho-English Bilingual Dictionary'
      }))
    );
    // Also delete any other imported categories
    await db.delete(dictionaryWords).where(
      eq(dictionaryWords.morphology, JSON.stringify({
        method: 'Semantic Calque',
        explanation: 'Imported from Bukantswe Sesotho-English Bilingual Dictionary'
      }))
    );
    console.log('Cleared previous Bukantswe dictionary imports from dictionary_words table.');
  } catch (clearErr) {
    console.log('No previous imports to clear or clear failed:', clearErr);
  }

  const batchSize = 1000;
  for (let i = 0; i < wordsToInsert.length; i += batchSize) {
    const batch = wordsToInsert.slice(i, i + batchSize);
    console.log(`Inserting batch ${i / batchSize + 1} of ${Math.ceil(wordsToInsert.length / batchSize)}...`);
    await db.insert(dictionaryWords).values(batch);
  }

  console.log('Bukantswe bilingual dictionary successfully imported!');
  process.exit(0);
}

// Simple drizzle-orm sql wrapper helper
import { sql } from 'drizzle-orm';

importBukantswe().catch(err => {
  console.error('Error importing Bukantswe dictionary:', err);
  process.exit(1);
});
