import { pgTable, serial, text, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').$type<'user' | 'moderator'>().default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const englishLexicon = pgTable('english_lexicon', {
  id: serial('id').primaryKey(),
  word: text('word').notNull().unique(),
});

export const dictionaryWords = pgTable('dictionary_words', {
  id: serial('id').primaryKey(),
  englishWord: text('english_word').notNull(),
  sesothoWord: text('sesotho_word').notNull(),
  partOfSpeech: text('part_of_speech').notNull(),
  category: text('category').$type<'mathematics' | 'biology' | 'physics' | 'chemistry' | 'computer_science' | 'general'>().notNull(),
  definition: text('definition').notNull(),
  morphology: text('morphology').notNull(), // JSON string detailing prefix, root, suffixes, coining method, and morphological description
  status: text('status').$type<'pending' | 'approved' | 'declined'>().default('pending').notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  approvedBy: integer('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
});

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  wordId: integer('word_id').references(() => dictionaryWords.id, { onDelete: 'cascade' }).notNull(),
  voteType: text('vote_type').$type<'up' | 'down'>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userWordIdx: uniqueIndex('user_word_idx').on(table.userId, table.wordId),
  };
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  wordsSuggested: many(dictionaryWords, { relationName: 'createdBy' }),
  wordsApproved: many(dictionaryWords, { relationName: 'approvedBy' }),
  votes: many(votes),
}));

export const dictionaryWordsRelations = relations(dictionaryWords, ({ one, many }) => ({
  creator: one(users, {
    fields: [dictionaryWords.createdBy],
    references: [users.id],
    relationName: 'createdBy',
  }),
  approver: one(users, {
    fields: [dictionaryWords.approvedBy],
    references: [users.id],
    relationName: 'approvedBy',
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  word: one(dictionaryWords, {
    fields: [votes.wordId],
    references: [dictionaryWords.id],
  }),
}));
