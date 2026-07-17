# LBOS Technical Architecture & API Reference
## Developer Documentation

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   LBOS Architecture                      │
│                                                          │
│  ┌──────────────┐     ┌───────────────┐     ┌────────┐ │
│  │   Frontend    │────▶│    Backend    │────▶│ Gemini │ │
│  │  React/Vite   │◀────│  Express/TS  │◀────│  API   │ │
│  │  Port 3000    │     │  Port 5000   │     │ (AI)   │ │
│  └──────────────┘     └──────┬────────┘     └────────┘ │
│                              │                           │
│                       ┌──────▼────────┐                  │
│                       │  PostgreSQL   │                  │
│                       │  (Drizzle)    │                  │
│                       └───────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Version |
|:---|:---|:---|
| Frontend Framework | React | 18+ |
| Frontend Build | Vite | Latest |
| Frontend Language | TypeScript | 5+ |
| Frontend Router | Wouter | Latest |
| CSS | Vanilla CSS (dark glassmorphism) | — |
| Backend Runtime | Node.js | 20+ |
| Backend Framework | Express.js | 4.x |
| Backend Language | TypeScript (via tsx) | 5+ |
| ORM | Drizzle ORM | Latest |
| Database | PostgreSQL | 15+ |
| AI Engine | Google Gemini API | gemini-2.5-flash |
| Auth | JWT (jsonwebtoken) | — |
| HTTP Client | Axios | — |
| Password Hashing | bcryptjs | — |
| Confetti | canvas-confetti | — |
| Icons | Lucide React | — |

---

## 3. Directory Structure

```
LanguageBuilders/
├── artifacts/                          ← Project documentation
│   ├── LBOS_Research_and_Implementation_Report.md
│   ├── Sesotho_Root_Dictionary.md
│   ├── Word_Building_Quick_Reference.md
│   ├── Sesotho_Orthography_Reference.md
│   └── Technical_Architecture.md       ← This file
│
├── backend/
│   ├── .env                            ← Environment variables
│   ├── index.ts                        ← Server entry point
│   ├── db.ts                           ← Database connection (Drizzle)
│   ├── schema.ts                       ← Database schema definitions
│   ├── routes.ts                       ← API route handlers
│   ├── morphology.ts                   ← 🧠 Core coining engine
│   ├── migrate.ts                      ← Database migration runner
│   ├── seed.ts                         ← Initial data seeding
│   ├── package.json                    ← Backend dependencies
│   └── tsconfig.json                   ← TypeScript config
│
├── sesosa-language-builder/
│   ├── src/
│   │   ├── App.tsx                     ← Main app + routing
│   │   ├── index.css                   ← Global styles
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx         ← Home/hero page
│   │   │   ├── AuthPage.tsx            ← Login & registration
│   │   │   ├── Workshop.tsx            ← 🔨 Coining workshop
│   │   │   ├── DictionaryExplorer.tsx  ← Dictionary browser
│   │   │   └── ModeratorDashboard.tsx  ← Approval queue
│   │   └── components/
│   │       └── Navbar.tsx              ← Navigation bar
│   ├── index.html                      ← HTML entry point
│   ├── package.json                    ← Frontend dependencies
│   ├── vite.config.ts                  ← Vite configuration
│   └── tsconfig.json                   ← TypeScript config
│
└── .git/                               ← Version control
```

---

## 4. Database Schema

### users
| Column | Type | Description |
|:---|:---|:---|
| id | SERIAL PRIMARY KEY | Auto-incrementing user ID |
| username | VARCHAR(100) UNIQUE | Login username |
| passwordHash | TEXT | bcrypt hashed password |
| role | VARCHAR(20) | 'user' or 'moderator' |
| createdAt | TIMESTAMP | Registration date |

### dictionary_words
| Column | Type | Description |
|:---|:---|:---|
| id | SERIAL PRIMARY KEY | Auto-incrementing word ID |
| englishWord | VARCHAR(200) | English source term |
| sesothoWord | VARCHAR(200) | Coined Sesotho word |
| partOfSpeech | VARCHAR(50) | e.g., "Noun (Class 7)" |
| category | VARCHAR(50) | physics, chemistry, biology, etc. |
| definition | TEXT | Full definition |
| morphology | TEXT (JSON) | Morphological analysis (JSON string) |
| status | VARCHAR(20) | 'pending', 'approved', 'declined' |
| createdBy | INTEGER FK | Reference to users.id |
| approvedBy | INTEGER FK | Reference to users.id (moderator) |
| createdAt | TIMESTAMP | Submission date |
| approvedAt | TIMESTAMP | Approval/decline date |

### votes
| Column | Type | Description |
|:---|:---|:---|
| id | SERIAL PRIMARY KEY | Auto-incrementing vote ID |
| userId | INTEGER FK | Reference to users.id |
| wordId | INTEGER FK | Reference to dictionary_words.id |
| voteType | VARCHAR(10) | 'up' or 'down' |

---

## 5. API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response** (201):
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "username": "johndoe",
    "role": "user"
  }
}
```

#### POST /api/auth/login
Login with existing credentials.

**Request/Response**: Same format as register.

#### GET /api/auth/me
Get current authenticated user profile. Requires `Authorization: Bearer <token>` header.

---

### Dictionary

#### GET /api/words
Fetch dictionary words with optional filters.

**Query Parameters**:
| Param | Type | Description |
|:---|:---|:---|
| search | string | Search in English, Sesotho, or definition |
| category | string | Filter by subject (physics, chemistry, etc.) |
| status | string | Filter by status (pending, approved, declined) |
| sortBy | string | Sort order (recent, votes, alphabetical) |

**Response**: Array of word objects with computed upvotes, downvotes, and userVote.

---

### Coining Engine

#### POST /api/words/synthesize
Run the AI coining engine for an English term. Requires authentication.

**Request Body**:
```json
{
  "englishWord": "molecule",
  "userHint": "optional user suggestion"
}
```

**Response** (CoinResult):
```json
{
  "conceptDecomposition": {
    "whatItDoes": "The smallest unit of a chemical compound",
    "whatItIsLike": "Tiny building blocks made of smaller blocks",
    "essence": "A small group of atoms bonded together",
    "relatedSesothoRoots": ["karolo (part)", "ho kopanya (combine)"]
  },
  "candidates": [
    {
      "sesothoWord": "karolwana",
      "method": "Semantic Calque",
      "strategyTier": 1,
      "prefix": null,
      "root": "karolo (part) + -wana (diminutive)",
      "suffix": null,
      "explanation": "Like Chinese 分子...",
      "definition": "A molecule...",
      "partOfSpeech": "Noun (Class 9)",
      "inspiration": "🇨🇳 Chinese: 分子 = divide-particle"
    }
  ]
}
```

---

### Word Submission

#### POST /api/words/suggest
Submit a coined word for community voting. Requires authentication.
If the submitter is a moderator, the word is auto-approved.

**Request Body**:
```json
{
  "englishWord": "molecule",
  "sesothoWord": "karolwana",
  "partOfSpeech": "Noun (Class 9)",
  "category": "chemistry",
  "definition": "The smallest unit of a chemical compound...",
  "morphology": "{\"method\":\"Semantic Calque\",\"explanation\":\"...\"}"
}
```

---

### Voting

#### POST /api/words/:id/vote
Vote on a word suggestion. Requires authentication.

**Request Body**:
```json
{
  "voteType": "up" | "down" | null
}
```

---

### Moderation

#### POST /api/words/:id/approve
Approve a pending word. Requires moderator role.

#### POST /api/words/:id/decline
Decline a pending word. Requires moderator role.

---

## 6. The Coining Engine (morphology.ts)

### Core Components

1. **SESOTHO_ROOTS** — Dictionary of 60+ verbs, 40+ nouns, 13+ adjectives
2. **STRATEGY_TIERS** — Configuration for the 5-tier priority system
3. **postProcessSpelling()** — Converts traditional → modern Gauteng orthography
4. **synthesizeLoanword()** — Heuristic phonetic transliteration (Tier 5)
5. **synthesizeDeverbative()** — Rule-based verb-to-noun derivation (Tier 3)
6. **STEM_FALLBACKS** — Hand-curated entries for key STEM terms
7. **coinWord()** — Main entry point; orchestrates AI + fallback pipeline

### Data Flow

```
coinWord(englishWord, userHint?)
│
├── Check STEM_FALLBACKS (curated entries)
│   └── Return if match found (no API call needed)
│
├── Call Gemini API with enriched prompt
│   ├── Provide concept decomposition instructions
│   ├── Provide Sesotho root dictionary context
│   ├── Require 4+ candidates across strategy tiers
│   ├── Post-process all words through postProcessSpelling()
│   ├── Sort by strategyTier (best first)
│   └── Prepend user hint if provided
│
└── Fallback: Local heuristic generator
    ├── synthesizeLoanword() → Tier 5 candidate
    ├── synthesizeDeverbative() → Tier 3 candidate
    ├── Compound with "matla-" → Tier 2 candidate
    └── User hint as Tier 1 candidate (if provided)
```

---

## 7. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lbos

# AI Engine
GEMINI_API_KEY=your-gemini-api-key

# Authentication
JWT_SECRET=your-jwt-secret-key
```

---

## 8. Running the Project

### Development Mode

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev    # tsx watch index.ts (port 5000)

# Terminal 2: Frontend
cd sesosa-language-builder
npm install
npm run dev    # vite dev server (port 3000)
```

### Database Setup

```bash
cd backend
npx tsx migrate.ts    # Run migrations
npx tsx seed.ts       # Seed initial data
```

---

*This document is part of the LBOS project technical documentation.*
