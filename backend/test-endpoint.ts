import { db } from './db.js';
import { users, dictionaryWords } from './schema.js';
import { eq } from 'drizzle-orm';

async function testEndpoint() {
  const jsonwebtoken = (await import('jsonwebtoken')).default;
  const testUser = await db.query.users.findFirst({ where: eq(users.username, 'test_voter') });
  const testWord = await db.query.dictionaryWords.findFirst({ where: eq(dictionaryWords.status, 'pending') });
  
  if (!testUser || !testWord) {
    console.error('User or Word not found');
    process.exit(1);
  }

  const token = jsonwebtoken.sign({ id: testUser.id, username: testUser.username, role: testUser.role }, 'super-secret-key-for-lbos-operating-system');

  console.log(`Sending vote to /api/words/${testWord.id}/vote...`);
  
  const response = await fetch(`http://localhost:5000/api/words/${testWord.id}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ voteType: 'up' })
  });

  const data = await response.json();
  console.log('Response:', data);
  
  const updatedWord = await db.query.dictionaryWords.findFirst({ where: eq(dictionaryWords.id, testWord.id) });
  console.log('Word status in DB:', updatedWord.status);
  process.exit(0);
}

testEndpoint().catch(console.error);
