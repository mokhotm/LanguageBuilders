import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import jsonwebtoken from 'jsonwebtoken';
import axios from 'axios';
import { db } from './db.js';
import { users, dictionaryWords, votes, englishLexicon } from './schema.js';
import { eq, and, or, ilike, desc, sql, count } from 'drizzle-orm';
import { coinWord, STRATEGY_TIERS } from './morphology.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-lbos-operating-system';

// Helper for JWT authentication middleware
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'user' | 'moderator';
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { id: number; username: string; role: 'user' | 'moderator' };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// 1. Register User
router.post('/auth/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.username, username.trim()),
    });

    if (existing) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Automatically make first user or username containing 'moderator' an admin/moderator
    const allUsers = await db.select().from(users).limit(1);
    const role = (allUsers.length === 0 || username.toLowerCase().includes('moderator')) ? 'moderator' : 'user';

    const [newUser] = await db.insert(users).values({
      username: username.trim(),
      passwordHash,
      role,
    }).returning();

    const token = jsonwebtoken.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login User
router.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username.trim()),
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jsonwebtoken.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Current User Profile
router.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Helper function to calculate relevance score for matching words
function calculateRelevance(word: any, query: string): number {
  const q = query.toLowerCase().trim();
  const english = word.englishWord.toLowerCase();
  const sesotho = word.sesothoWord.toLowerCase();
  const definition = word.definition ? word.definition.toLowerCase() : '';

  // 1. Exact match on English word
  if (english === q) return 100;
  // 2. Exact match on Sesotho word
  if (sesotho === q) return 95;

  // 3. Exact word match in English word (using word boundaries)
  // e.g. "rope" matches "rope (Afr: tou)" as a whole word
  const englishWords = english.split(/[^a-zA-Z0-9]+/);
  if (englishWords.includes(q)) return 80;

  // 4. Exact word match in Sesotho word
  const sesothoWords = sesotho.split(/[^a-zA-Z0-9]+/);
  if (sesothoWords.includes(q)) return 75;

  // 5. English word starts with query
  if (english.startsWith(q)) return 60;
  // 6. Sesotho word starts with query
  if (sesotho.startsWith(q)) return 55;

  // 7. Exact word match in definition
  const defWords = definition.split(/[^a-zA-Z0-9]+/);
  if (defWords.includes(q)) return 40;

  // 8. Definition starts with query
  if (definition.startsWith(q)) return 30;

  // 9. Substring match in English word
  if (english.includes(q)) return 20;
  // 10. Substring match in Sesotho word
  if (sesotho.includes(q)) return 15;
  // 11. Substring match in definition
  if (definition.includes(q)) return 10;

  return 0;
}

// 4. Fetch Dictionary Words (With Search, Filter, Vote Tallies)
router.get('/words', async (req: AuthRequest, res: Response) => {
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;
  const status = req.query.status as string | undefined; // 'pending' | 'approved' | 'declined'
  const sortBy = req.query.sortBy as string | undefined; // 'votes' | 'alphabetical' | 'recent'
  const letter = req.query.letter as string | undefined; // 'A' | 'B' | ... | 'Z'
  
  // Optional auth token verification for personal vote detection
  const authHeader = req.headers['authorization'];
  let currentUserId: number | null = null;
  if (authHeader && authHeader.split(' ')[1]) {
    try {
      const decoded = jsonwebtoken.verify(authHeader.split(' ')[1], JWT_SECRET) as { id: number };
      currentUserId = decoded.id;
    } catch (_) {}
  }

  try {
    // 1. Standard query for translated words
    // If status is "untranslated", we skip translated words to return only untranslated ones.
    let translatedList: any[] = [];
    if (status !== 'untranslated') {
      translatedList = await db.select({
        id: dictionaryWords.id,
        englishWord: dictionaryWords.englishWord,
        sesothoWord: dictionaryWords.sesothoWord,
        partOfSpeech: dictionaryWords.partOfSpeech,
        category: dictionaryWords.category,
        definition: dictionaryWords.definition,
        morphology: dictionaryWords.morphology,
        status: dictionaryWords.status,
        createdBy: dictionaryWords.createdBy,
        createdAt: dictionaryWords.createdAt,
        creatorUsername: users.username,
        upvotes: sql<number>`COALESCE(SUM(CASE WHEN ${votes.voteType} = 'up' THEN 1 ELSE 0 END), 0)::integer`,
        downvotes: sql<number>`COALESCE(SUM(CASE WHEN ${votes.voteType} = 'down' THEN 1 ELSE 0 END), 0)::integer`,
        userVote: currentUserId 
          ? sql<string | null>`MAX(CASE WHEN ${votes.userId} = ${currentUserId} THEN ${votes.voteType} ELSE NULL END)`
          : sql<string | null>`NULL`,
      })
      .from(dictionaryWords)
      .leftJoin(users, eq(dictionaryWords.createdBy, users.id))
      .leftJoin(votes, eq(dictionaryWords.id, votes.wordId))
      .where(and(
        status && !search ? eq(dictionaryWords.status, status as any) : undefined,
        category && category !== 'all' ? eq(dictionaryWords.category, category as any) : undefined,
        search ? (() => {
          const escaped = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const pattern = `\\y${escaped}\\y`;
          return or(
            sql`${dictionaryWords.englishWord} ~* ${pattern}`,
            sql`${dictionaryWords.sesothoWord} ~* ${pattern}`,
            sql`${dictionaryWords.definition} ~* ${pattern}`
          );
        })() : undefined,
        letter ? ilike(dictionaryWords.sesothoWord, `${letter}%`) : undefined
      ))
      .groupBy(dictionaryWords.id, users.username);
    }

    // 2. If search is active or status is untranslated, fetch untranslated terms from englishLexicon
    let untranslatedList: any[] = [];
    if (search || status === 'untranslated') {
      untranslatedList = await db.select({
        id: sql<number>`-1 * ${englishLexicon.id}`,
        englishWord: englishLexicon.word,
        sesothoWord: sql<string>`''`,
        partOfSpeech: sql<string>`'Noun'`,
        category: sql<string>`'general'`,
        definition: sql<string>`'Not yet translated.'`,
        morphology: sql<string>`'{}'`,
        status: sql<string>`'untranslated'`,
        createdBy: sql<number | null>`null`,
        createdAt: sql<string>`now()`,
        creatorUsername: sql<string | null>`null`,
        upvotes: sql<number>`0`,
        downvotes: sql<number>`0`,
        userVote: sql<string | null>`null`,
      })
      .from(englishLexicon)
      .leftJoin(
        dictionaryWords,
        and(
          eq(englishLexicon.word, dictionaryWords.englishWord),
          or(
            eq(dictionaryWords.status, 'approved'),
            eq(dictionaryWords.status, 'pending')
          )
        )
      )
      .where(and(
        sql`${dictionaryWords.id} IS NULL`, // no approved/pending translation exists
        search ? (() => {
          const escaped = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          return sql`${englishLexicon.word} ~* ${`\\y${escaped}\\y`}`;
        })() : undefined,
        letter ? ilike(englishLexicon.word, `${letter}%`) : undefined
      ))
      .limit(100);
    }

    // 3. Combine both lists
    let combined = [...translatedList, ...untranslatedList];

    // Apply sorting in memory
    let sorted = [...combined];
    if (search) {
      // Pre-calculate relevance scores to avoid re-calculating during sorting
      const scores = new Map<string, number>();
      const getScore = (w: any) => {
        const key = `${w.id}-${w.englishWord}-${w.sesothoWord}`;
        if (scores.has(key)) return scores.get(key)!;
        const score = calculateRelevance(w, search);
        scores.set(key, score);
        return score;
      };

      sorted.sort((a, b) => {
        const scoreA = getScore(a);
        const scoreB = getScore(b);
        if (scoreB !== scoreA) {
          return scoreB - scoreA; // sort by relevance descending
        }
        // Tie-breaker: put untranslated at the end
        if (a.status === 'untranslated' && b.status !== 'untranslated') return 1;
        if (a.status !== 'untranslated' && b.status === 'untranslated') return -1;
        // Tie-breaker 2: sortBy preferences
        if (sortBy === 'votes') {
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        } else if (sortBy === 'alphabetical') {
          return a.englishWord.localeCompare(b.englishWord);
        } else {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
    } else {
      // Standard non-search sorting
      if (sortBy === 'votes') {
        sorted.sort((a, b) => {
          const netA = a.upvotes - a.downvotes;
          const netB = b.upvotes - b.downvotes;
          return netB - netA;
        });
      } else if (sortBy === 'alphabetical') {
        sorted.sort((a, b) => a.englishWord.localeCompare(b.englishWord));
      } else {
        sorted.sort((a, b) => {
          if (a.status === 'untranslated' && b.status !== 'untranslated') return 1;
          if (a.status !== 'untranslated' && b.status === 'untranslated') return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
    }

    res.json(sorted.slice(0, 100));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Coining Synthesizer (Heuristic + AI Suggestions)
router.post('/words/synthesize', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { englishWord, userHint, excludeWords } = req.body;

  if (!englishWord) {
    return res.status(400).json({ error: 'English word is required' });
  }

  try {
    const cleanEng = englishWord.trim().toLowerCase();

    // 1. Check if we have an approved translation in the database (only if not generating additional options)
    if (!excludeWords || excludeWords.length === 0) {
      const existingApproved = await db.select().from(dictionaryWords).where(
        and(
          ilike(dictionaryWords.englishWord, cleanEng),
          eq(dictionaryWords.status, 'approved')
        )
      );

      // Filter out loanwords
      const nonLoanwords = existingApproved.filter(w => {
        try {
          const morph = JSON.parse(w.morphology || '{}');
          return morph.method !== 'Loanword';
        } catch (_) {
          return true; // assume not a loanword if JSON parsing fails
        }
      });

      if (nonLoanwords.length > 0) {
        const candidates = nonLoanwords.map(w => {
          let explanation = 'Sefolelo sena se se se le teng ka har\'a buka ya mantswe (This translation already exists in the dictionary).';
          let method = 'Semantic Extension';
          try {
            const morph = JSON.parse(w.morphology || '{}');
            explanation = morph.explanation || explanation;
            method = morph.method || method;
          } catch (_) {}

          return {
            sesothoWord: w.sesothoWord,
            method: method as any,
            strategyTier: 1 as any,
            explanation: `🏆 E se e le teng (Already exists): ${explanation}`,
            definition: w.definition,
            partOfSpeech: w.partOfSpeech,
            alreadyExists: true
          };
        });

        return res.json({
          candidates,
          conceptDecomposition: {
            whatItDoes: nonLoanwords[0].definition,
            whatItIsLike: `Existing word in the dictionary`,
            essence: `This concept is already mapped in standard Sesotho.`,
            relatedSesothoRoots: [nonLoanwords[0].sesothoWord]
          },
          alreadyExists: true
        });
      }
    }

    const candidates = await coinWord(englishWord, userHint, excludeWords);
    res.json(candidates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Submit a Word Suggestion
router.post('/words/suggest', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { englishWord, sesothoWord, partOfSpeech, category, definition, morphology } = req.body;

  if (!englishWord || !sesothoWord || !partOfSpeech || !category || !definition) {
    return res.status(400).json({ error: 'Missing required suggestion fields' });
  }

  try {
    // If morphology is passed as an object, serialize to string
    const morphString = typeof morphology === 'object' ? JSON.stringify(morphology) : (morphology || '{}');

    // Create the suggestion. If the submitting user is a moderator, approve it immediately!
    const isMod = req.user?.role === 'moderator';
    const status = isMod ? 'approved' : 'pending';

    const [newWord] = await db.insert(dictionaryWords).values({
      englishWord: englishWord.trim(),
      sesothoWord: sesothoWord.trim(),
      partOfSpeech,
      category,
      definition,
      morphology: morphString,
      status,
      createdBy: req.user!.id,
      approvedBy: isMod ? req.user!.id : null,
      approvedAt: isMod ? new Date() : null,
    }).returning();

    // If it's a new suggestion, auto upvote it by the creator
    await db.insert(votes).values({
      userId: req.user!.id,
      wordId: newWord.id,
      voteType: 'up',
    });

    res.status(201).json(newWord);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Vote on a Word
router.post('/words/:id/vote', authenticateToken, async (req: AuthRequest, res: Response) => {
  const wordId = parseInt(req.params.id);
  const { voteType } = req.body; // 'up' | 'down' | null (null removes vote)

  if (isNaN(wordId)) {
    return res.status(400).json({ error: 'Invalid word ID' });
  }

  if (voteType !== 'up' && voteType !== 'down' && voteType !== null) {
    return res.status(400).json({ error: 'Invalid voteType (must be up, down, or null)' });
  }

  const userId = req.user!.id;

  try {
    // Check if user already voted
    const existing = await db.query.votes.findFirst({
      where: and(eq(votes.userId, userId), eq(votes.wordId, wordId)),
    });

    if (voteType === null) {
      if (existing) {
        await db.delete(votes).where(eq(votes.id, existing.id));
      }
      return res.json({ success: true, message: 'Vote removed' });
    }

    if (existing) {
      // Update vote type
      await db.update(votes).set({ voteType }).where(eq(votes.id, existing.id));
    } else {
      // Create new vote
      await db.insert(votes).values({
        userId,
        wordId,
        voteType,
      });
    }

    // Auto-Approve logic: Check net votes
    const wordVotes = await db.select({
      upvotes: sql<number>`COALESCE(SUM(CASE WHEN ${votes.voteType} = 'up' THEN 1 ELSE 0 END), 0)::integer`,
      downvotes: sql<number>`COALESCE(SUM(CASE WHEN ${votes.voteType} = 'down' THEN 1 ELSE 0 END), 0)::integer`,
    }).from(votes).where(eq(votes.wordId, wordId));
    
    let isAutoApproved = false;
    if (wordVotes.length > 0) {
      const netVotes = wordVotes[0].upvotes - wordVotes[0].downvotes;
      if (netVotes >= 100) {
        await db.update(dictionaryWords)
          .set({ status: 'approved', approvedAt: new Date() })
          .where(eq(dictionaryWords.id, wordId));
        isAutoApproved = true;
      }
    }

    res.json({ success: true, autoApproved: isAutoApproved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Moderator: Approve Word
router.post('/words/:id/approve', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'moderator') {
    return res.status(403).json({ error: 'Only language moderators can approve words' });
  }

  const wordId = parseInt(req.params.id);
  if (isNaN(wordId)) {
    return res.status(400).json({ error: 'Invalid word ID' });
  }

  try {
    await db.update(dictionaryWords)
      .set({
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      })
      .where(eq(dictionaryWords.id, wordId));

    res.json({ success: true, message: 'Word approved and finalized in the dictionary' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Moderator: Decline Word
router.post('/words/:id/decline', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'moderator') {
    return res.status(403).json({ error: 'Only language moderators can decline words' });
  }

  const wordId = parseInt(req.params.id);
  if (isNaN(wordId)) {
    return res.status(400).json({ error: 'Invalid word ID' });
  }

  try {
    await db.update(dictionaryWords)
      .set({
        status: 'declined',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      })
      .where(eq(dictionaryWords.id, wordId));

    res.json({ success: true, message: 'Word declined and archived' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Lexicon Coverage Stats
router.get('/words/coverage', async (req: Request, res: Response) => {
  try {
    const totalRes = await db.select({ value: count() }).from(englishLexicon);
    const totalEnglishWords = totalRes[0].value;

    const correlatedQuery = await db.execute(sql`
      SELECT COUNT(DISTINCT english_word) as count FROM dictionary_words WHERE status = 'approved'
    `);
    const correlatedWords = Number(correlatedQuery.rows[0].count);

    const coveragePercentage = totalEnglishWords > 0 ? (correlatedWords / totalEnglishWords) * 100 : 0;

    res.json({
      totalEnglishWords,
      correlatedWords,
      coveragePercentage
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Chatbot Endpoint (Gemini-powered)
router.post('/chat', async (req: Request, res: Response) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.json({ 
      reply: "Dumela! (Hello!) Ke mothusi oa gago oa AI, Polelo (I am your AI assistant, Polelo). The Gemini API key is not configured, but I can tell you that I'm fully aligned with the UCT MzansiLLM project for standard Sesotho orthography." 
    });
  }

  try {
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemPrompt = `You are Polelo, the AI Dictionary Assistant for LBOS (Language Builder OS), aligned with the UCT MzansiLLM project.
Your job is to help users understand, translate, and coin STEM (Science, Technology, Engineering, Mathematics) words in Southern Sotho (Sesotho).
Always ground your answers in standard South African Sesotho orthography (no macrons or circumflexes).
Provide helpful explanations of nominalization, compounding, and calques when users ask about how words are built.
Keep your responses concise, engaging, and friendly. Use Markdown formatting.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      }
    );

    const replyText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
      "Ntshwarele, ke sitilwe ho araba hona jwale. (Apologies, I could not answer right now.)";

    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Chatbot API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

export default router;
