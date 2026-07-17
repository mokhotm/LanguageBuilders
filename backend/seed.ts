import { db } from './db.js';
import { users, dictionaryWords, votes } from './schema.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding the database...');

  try {
    // 1. Create default users
    const modPasswordHash = await bcrypt.hash('Admin@123', 10);
    const userPasswordHash = await bcrypt.hash('User@123', 10);

    const [moderatorUser] = await db.insert(users).values({
      username: 'moderator',
      passwordHash: modPasswordHash,
      role: 'moderator',
    }).returning();

    const [regularUser] = await db.insert(users).values({
      username: 'sotho_builder',
      passwordHash: userPasswordHash,
      role: 'user',
    }).returning();

    console.log('Users created: moderator, sotho_builder');

    // 2. Base STEM words to seed
    const wordsToSeed = [
      {
        englishWord: 'gravity',
        sesothoWord: 'matlakgohedi',
        partOfSpeech: 'Noun (Class 6)',
        category: 'physics' as const,
        definition: 'The force that attracts a body towards the centre of the earth, or towards any other physical body having mass.',
        morphology: JSON.stringify({
          method: 'Compounding',
          parts: ['matla (force/power)', 'kgohedi (attractor, from ho hohela)'],
          explanation: 'Compounded from "matla" (force/power) and "kgohedi" (attractor). Literally: "pulling force".'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'computer',
        sesothoWord: 'khomphutara',
        partOfSpeech: 'Noun (Class 9)',
        category: 'computer_science' as const,
        definition: 'An electronic device for storing and processing data, typically in binary form, according to instructions given to it in a variable program.',
        morphology: JSON.stringify({
          method: 'Loanword',
          explanation: 'Phonetic adaptation of "computer" to match Sesotho open-syllable phonotactics (CV structure).'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'biology',
        sesothoWord: 'baoloji',
        partOfSpeech: 'Noun (Class 9)',
        category: 'biology' as const,
        definition: 'The scientific study of physiology, behavior, and other physical aspects of living organisms.',
        morphology: JSON.stringify({
          method: 'Loanword',
          explanation: 'Transliterated loanword adapting "biology" to Sesotho syllables.'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'oxygen',
        sesothoWord: 'moyabophelo',
        partOfSpeech: 'Noun (Class 3)',
        category: 'chemistry' as const,
        definition: 'A colorless, odorless highly reactive gas, the chemical element of atomic number 8 and the life-supporting component of the air.',
        morphology: JSON.stringify({
          method: 'Compounding',
          parts: ['moya (air/breath)', 'bophelo (life)'],
          explanation: 'Compounded from "moya" (air/breath) and "bophelo" (life). Literally: "air of life".'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'mathematics',
        sesothoWord: 'dipalo',
        partOfSpeech: 'Noun (Class 10)',
        category: 'mathematics' as const,
        definition: 'The abstract science of number, quantity, and space, studied in its own right or in application to other disciplines.',
        morphology: JSON.stringify({
          method: 'Nominalization',
          prefix: 'di-',
          root: 'bala (count)',
          suffix: '-o',
          explanation: 'Class 10 plural of "palo" (number), which is nominalized from the verb "ho bala" (to count) using suffix "-o" and prefix "di-". Literally: "the counts".'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'multiplication',
        sesothoWord: 'atiso',
        partOfSpeech: 'Noun (Class 9)',
        category: 'mathematics' as const,
        definition: 'The mathematical operation of scaling one number by another.',
        morphology: JSON.stringify({
          method: 'Nominalization',
          root: 'atisa (increase/multiply)',
          suffix: '-o',
          explanation: 'Deverbative nominalization from "ho atisa" (to increase/multiply) using nominalizing suffix "-o".'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'division',
        sesothoWord: 'karolo',
        partOfSpeech: 'Noun (Class 9)',
        category: 'mathematics' as const,
        definition: 'The action of separating something into parts or the process of being separated.',
        morphology: JSON.stringify({
          method: 'Nominalization',
          root: 'arola (divide)',
          suffix: '-o',
          explanation: 'Class 9 sound-change nominalization of "ho arola" (to divide). Sound change transforms "a" into "ka" and ending to "-o". Literally: "a portion or partition".'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'addition',
        sesothoWord: 'tlhakanyo',
        partOfSpeech: 'Noun (Class 9)',
        category: 'mathematics' as const,
        definition: 'The process of calculating the total of two or more numbers.',
        morphology: JSON.stringify({
          method: 'Nominalization',
          root: 'hlakanya (mix/combine)',
          suffix: '-o',
          explanation: 'Deverbative nominalization of verb "ho hlakanya" (to combine). Sound-changes "h" to "th" resulting in "tlhakanyo".'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'circle',
        sesothoWord: 'sediko',
        partOfSpeech: 'Noun (Class 7)',
        category: 'mathematics' as const,
        definition: 'A round plane figure whose boundary consists of points equidistant from a fixed point.',
        morphology: JSON.stringify({
          method: 'Nominalization',
          prefix: 'se-',
          root: 'dika (encircle)',
          suffix: '-o',
          explanation: 'Formed from "ho dika" (to encircle) using Class 7 prefix "se-" indicating shapes/customs and suffix "-o". Literally: "encircling thing".'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'energy',
        sesothoWord: 'eneji',
        partOfSpeech: 'Noun (Class 9)',
        category: 'physics' as const,
        definition: 'Power derived from physical or chemical resources, especially to provide light and heat or to work machines.',
        morphology: JSON.stringify({
          method: 'Loanword',
          explanation: 'Transliterated borrowing of "energy".'
        }),
        status: 'approved' as const,
        createdBy: regularUser.id,
        approvedBy: moderatorUser.id,
        approvedAt: new Date(),
      },
      {
        englishWord: 'respiration',
        sesothoWord: 'femollo',
        partOfSpeech: 'Noun (Class 9)',
        category: 'biology' as const,
        definition: 'The biochemical process where cells of an organism obtain energy by combining oxygen and glucose.',
        morphology: JSON.stringify({
          method: 'Nominalization',
          root: 'hema (breathe)',
          suffix: '-ollo',
          explanation: 'Derived from "ho hema" (to breathe) using the reversive extension "-olla" indicating continuous/un-breathing flow, and nominalized with Class 9 shift (h -> f).'
        }),
        status: 'pending' as const,
        createdBy: regularUser.id,
      },
      {
        englishWord: 'virus',
        sesothoWord: 'baerase',
        partOfSpeech: 'Noun (Class 9)',
        category: 'biology' as const,
        definition: 'An infective agent that typically consists of a nucleic acid molecule in a protein coat.',
        morphology: JSON.stringify({
          method: 'Loanword',
          explanation: 'Transliteration of "virus" matching CV syllabics.'
        }),
        status: 'pending' as const,
        createdBy: regularUser.id,
      }
    ];

    for (const word of wordsToSeed) {
      const [insertedWord] = await db.insert(dictionaryWords).values(word).returning();
      
      // Auto-add upvote by creator
      await db.insert(votes).values({
        userId: word.createdBy,
        wordId: insertedWord.id,
        voteType: 'up',
      });
      
      // Auto-add upvote by moderator for approved words
      if (word.status === 'approved') {
        await db.insert(votes).values({
          userId: moderatorUser.id,
          wordId: insertedWord.id,
          voteType: 'up',
        });
      }
    }

    console.log('Words seeded successfully!');
  } catch (err: any) {
    console.error('Error during seeding:', err.message);
  } finally {
    process.exit(0);
  }
}

seed();
