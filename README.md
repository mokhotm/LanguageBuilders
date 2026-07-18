# LBOS — Language Builder Operating System
### Oxford-Standard Sesotho Bilingual & STEM Dictionary + AI Word Coining Engine

LBOS is a modern, web-based dictionary platform and AI-powered word synthesis engine for **Sesotho (Southern Sotho)**, focusing on technical and STEM (Science, Technology, Engineering, and Mathematics) terminology.

---

## 🌟 Key Features

### 1. 📖 Comprehensive Bilingual & STEM Dictionary
- **10,086+ Entries**: Loaded from historical lexicographical sources, standard bilingual dictionary databases, and STEM lexicons.
- **STEM Auto-Classification**: Automatically categorized into 12 primary STEM subjects (*Physics, Chemistry, Biology, Mathematics, Computer Science, Psychology, Geography, Philosophy, Engineering, Architecture, Astronomy, and Technology*).
- **Official Subject Definitions**: Seeded with standard native Sesotho terms for all 12 primary STEM disciplines (e.g. *Computer Science* &rarr; *Thutosebali*, *Chemistry* &rarr; *Thutakopanyo*).

### 2. 📑 10 Words/Page Pagination & Complete Lexicon Explorer
- **Server-Side Pagination**: Removed the hard 100-word limit. Supports page-based fetching (`/api/words?page=1&limit=10`) with full dataset coverage across 10,100+ words.
- **Interactive Dual Pagination Bars**: Features glassmorphic pagination control bars at the top and bottom of the word list with range tracking (*Showing 1-10 of 10,100 words*), page numbers, jump controls (`Qala`, `Pele`, `E Nngwe`, `Bofelo`), and configurable items-per-page selectors (10, 25, 50, 100).

### 3. 🔍 Advanced Whole-Word POSIX Search & Relevance Ranking
- **Whole-Word Matching**: Employs PostgreSQL POSIX regular expressions (`~*`) with word boundaries (`\y`) to exclude noisy sub-word matches (e.g. searching for `"rope"` matches `"rope"` without returning unrelated terms like `"Europe"` or `"property"`).
- **Dynamic Relevance Ranking**: Matches are scored and sorted by relevance (Exact match = 100pts, Whole-word phrase = 80pts, Prefix match = 60pts, Substring match = 10–20pts).
- **Smart Tab Auto-Switching**: Automatically selects the status tab (Approved, Pending, Untranslated, or Declined) containing the exact search match.

### 4. 🎓 Academic PanSALB / DSAC 5-Tier Bantu Terminology Coining Engine
Implements the 5 official terminology coining methodologies recognized by the **Pan South African Language Board (PanSALB)** and the **Department of Sport, Arts and Culture (DSAC)**:
1. **Semantic Transfer & Extension (*Keketso ya Tlhaloso*)**: Assigning technical scientific meanings to existing words (e.g. *kokwanahloko* = virus).
2. **Deverbative Nominalization (*Sebopeho sa Leleba*)**: Deriving technical nouns from verb roots using Noun Class Prefixes (e.g. *setsamaisi* = engine).
3. **Descriptive Compounding (*Kopanyo ya Mantswe*)**: Combining native roots into self-explanatory terms (e.g. *sebaladipalo* = number-counter / computer).
4. **Semantic Calquing (*Tlhaloso-Bapisi*)**: Mirroring internal semantic structures of purist languages (e.g. Chinese 电脑 *electric brain* &rarr; *kelello ya motlakase*).
5. **Phonetic Adaptation (*Kadimano ya Modumo*)**: Last-resort phonetic borrowing for international terms.

### 5. 🧪 Recursive Definition Stack Coining Pipeline
- **2-Stage Semantic Decomposition**:
  1. **Stage 1 (Definition Stack Extractor)**: Deconstructs an English STEM term by fetching its standard definition and extracting/defining its constituent technical concepts (e.g. for *computer*, it extracts and defines *electronic device, hardware, software, automation, calculations, and task*).
  2. **Stage 2 (Grounded Coining Prompt)**: Feeds the semantic stack into the **MzansiLLM** prompt pipeline to generate natural, idiomatic Sesotho terms based on functional and physical essence, avoiding weird or literal translations.
- **Reuse of Existing Words**: Automatically checks the dictionary for approved native words before coining new ones (e.g., returning **tshipi** for *Iron* with a `🏆 E se e le teng` badge).

### 6. ✍️ Modern Sesotho Orthography Standard
Adheres strictly to modern South African standard/Gauteng Sesotho spelling conventions (enforced via `.agents/AGENTS.md`, AI prompts, and `postProcessSpelling` rules):
- **`di` for `li`**: Uses **d** before **i** (e.g. *modimo* instead of *molimo*, *dikobo* instead of *likobo*).
- **`wa`/`w` for `oa`/`o`**: Uses **w** in semi-vocalic glides (e.g. *ngwana* instead of *ngoana*, *senwamadi* instead of *senoamali*).
- **`sea-` for `sy-`**: Uses **sea-** in instrumental deverbative nominalization (e.g. *seakanyi* instead of *syakanyi*).

### 7. 🤖 Integrated Chatbot Assistant ("Polelo")
- Embedded floating chat assistant named **Polelo** ("speech/statement" in Sesotho).
- Powered by Gemini, grounded to assist users with Sesotho grammar, vocabulary, etymology, and modern South African spelling standards.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL, Gemini API (`@google/generative-ai`).
- **Frontend**: React, Vite, Lucide React, Wouter router, Vanilla CSS design system.
- **AI/LLM**: Google Gemini 3.5 Flash (MzansiLLM coining model & Definition Stack pipeline).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```
   Add your PostgreSQL connection string (`DATABASE_URL`) and Gemini API key (`GEMINI_API_KEY`).

3. Install dependencies and run migrations:
   ```bash
   npm install
   npx tsx migrate.ts
   ```

4. Seed the database and reprocess dictionary entries:
   ```bash
   npx tsx scripts/import-bukantswe.ts
   npx tsx scripts/seed-stem-subjects.ts
   npx tsx scripts/reprocess-dictionary.ts
   ```

5. Start the backend dev server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd sesosa-language-builder
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

---

## 📡 Primary API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/words` | Search and filter dictionary words (supports `search`, `category`, `status`, `letter`, `sortBy`, `page`, `limit`). |
| `POST` | `/api/words/synthesize` | Generate Sesotho word candidates using the 2-stage Definition Stack pipeline. |
| `POST` | `/api/words/reprocess` | Auto-approve existing valid translations and batch-coin missing lexicon terms. |
| `POST` | `/api/words` | Submit a new word candidate for community review. |
| `POST` | `/api/chat` | Interact with **Polelo** AI floating assistant. |
| `POST` | `/api/auth/login` | User login & authentication. |

---

## 📜 License
This project is licensed under the MIT License.
