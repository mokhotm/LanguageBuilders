# LBOS — Language Builder Operating System
### Oxford-Standard Sesotho Bilingual & STEM Dictionary + AI Word Coining Engine

LBOS is a modern, web-based dictionary platform and AI-powered word synthesis engine for **Sesotho (Southern Sotho)**, focusing on technical and STEM (Science, Technology, Engineering, and Mathematics) terminology.

---

## 🌟 Key Features

### 1. 📖 Comprehensive Bilingual & STEM Dictionary
- **10,086+ Entries**: Loaded from historical lexicographical sources and bilingual dictionary databases.
- **STEM Auto-Classification**: Automatically categorized into subjects like *Physics, Chemistry, Biology, Mathematics, Computer Science, Psychology, Geography, Philosophy, Engineering, Architecture, Astronomy, and Technology*.
- **Official Subject Definitions**: Seeded with standard native Sesotho terms for 12 primary STEM disciplines (e.g. *Computer Science* &rarr; *Thutosebali*, *Chemistry* &rarr; *Thutakopanyo*).

### 2. 🔍 Advanced Whole-Word POSIX Search & Relevance Ranking
- **Whole-Word Matching**: Employs PostgreSQL POSIX regular expressions (`~*`) with word boundaries (`\y`) to exclude noisy sub-word matches (e.g. searching for `"rope"` matches `"rope"` without returning unrelated terms like `"Europe"` or `"property"`).
- **Dynamic Relevance Ranking**: Matches are scored and sorted by relevance (Exact match = 100pts, Whole-word phrase = 80pts, Prefix match = 60pts, Substring match = 10–20pts).
- **Smart Tab Auto-Switching**: Automatically selects the status tab (Approved, Pending, Untranslated, or Declined) containing the exact search match.

### 3. 🧪 Recursive Definition Stack Coining Engine
- **2-Stage Semantic Decomposition**:
  1. **Stage 1 (Definition Stack Extractor)**: Deconstructs an English STEM term by fetching its standard definition and extracting/defining its constituent technical concepts (e.g. for *computer*, it extracts and defines *electronic device, hardware, software, automation, calculations, and task*).
  2. **Stage 2 (Grounded Coining Prompt)**: Feeds the semantic stack into the **MzansiLLM** prompt pipeline to generate natural, idiomatic Sesotho terms based on functional and physical essence, avoiding weird or literal translations.
- **Reuse of Existing Words**: Automatically checks the dictionary for approved native words before coining new ones (e.g., returning **tshipi** for *Iron* with a `🏆 E se e le teng` badge).

### 4. ✍️ Modern Sesotho Orthography Standard
Adheres strictly to modern South African standard/Gauteng Sesotho spelling conventions (enforced via `.agents/AGENTS.md`, AI prompts, and `postProcessSpelling` rules):
- **`di` for `li`**: Uses **d** before **i** (e.g. *modimo* instead of *molimo*, *dikobo* instead of *likobo*).
- **`wa`/`w` for `oa`/`o`**: Uses **w** in semi-vocalic glides (e.g. *ngwana* instead of *ngoana*, *senwamadi* instead of *senoamali*).

### 5. 🤖 Integrated Chatbot Assistant ("Polelo")
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

4. Seed the database (Optional):
   ```bash
   npx tsx scripts/import-bukantswe.ts
   npx tsx scripts/seed-stem-subjects.ts
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
| `GET` | `/api/words` | Search and filter dictionary words (supports `search`, `category`, `status`, `letter`, `sortBy`). |
| `POST` | `/api/words/synthesize` | Generate Sesotho word candidates using the Definition Stack pipeline. |
| `POST` | `/api/words` | Submit a new word candidate for community review. |
| `POST` | `/api/chatbot` | Interact with **Polelo** AI floating assistant. |
| `POST` | `/api/auth/login` | User login & authentication. |

---

## 📜 License
This project is licensed under the MIT License.
