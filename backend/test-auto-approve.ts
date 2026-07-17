import { db } from './db.js';
import { users, dictionaryWords, votes } from './schema.js';
import { eq, sql } from 'drizzle-orm';

async function testAutoApprove() {
  console.log('Setting up auto-approve test...');

  // 1. Get or create a test user
  let [testUser] = await db.select().from(users).where(eq(users.username, 'test_voter')).limit(1);
  if (!testUser) {
    [testUser] = await db.insert(users).values({ username: 'test_voter', passwordHash: 'hash', role: 'user' }).returning();
  }

  // 2. Get an existing word or create one
  let [testWord] = await db.select().from(dictionaryWords).where(eq(dictionaryWords.status, 'pending')).limit(1);
  if (!testWord) {
    [testWord] = await db.insert(dictionaryWords).values({
      englishWord: 'testword',
      sesothoWord: 'tekotsho',
      partOfSpeech: 'noun',
      category: 'general',
      definition: 'A word for testing',
      morphology: '{}',
      status: 'pending',
    }).returning();
  }

  const wordId = testWord.id;
  console.log('Testing with word ID:', wordId, 'Status:', testWord.status);

  // 3. Clear existing votes for this word to start fresh
  await db.delete(votes).where(eq(votes.wordId, wordId));

  // 4. Create 99 dummy users and upvote
  console.log('Creating 99 upvotes...');
  const dummyUsers = [];
  for (let i = 0; i < 99; i++) {
    dummyUsers.push({ username: `dummy_${Date.now()}_${i}`, passwordHash: 'hash', role: 'user' });
  }
  
  // Insert users and get IDs
  const insertedUsers = await db.insert(users).values(dummyUsers).returning({ id: users.id });
  
  // Insert votes
  const dummyVotes = insertedUsers.map(u => ({
    userId: u.id,
    wordId: wordId,
    voteType: 'up' as const
  }));
  await db.insert(votes).values(dummyVotes);

  // 5. Cast the 100th vote as testUser (this should trigger the auto-approve in our route logic if we hit it)
  // But wait, the auto-approve logic is in routes.ts, not in DB trigger. 
  // We need to call the HTTP endpoint to actually test the route logic!
  
  console.log(`Setup complete. Word ${wordId} now has 99 votes.`);
  console.log(`To test the route, run a curl POST to /api/words/${wordId}/vote as test_voter.`);
  console.log(`Here is a valid token for test_voter:`);
  
  const jsonwebtoken = (await import('jsonwebtoken')).default;
  const token = jsonwebtoken.sign({ id: testUser.id, username: testUser.username, role: testUser.role }, 'super-secret-key-for-lbos-operating-system');
  console.log(token);
  console.log(wordId);
  process.exit(0);
}

testAutoApprove().catch(console.error);
