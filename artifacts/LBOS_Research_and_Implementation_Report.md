# LBOS — Language Builder Operating System
## Complete Research & Implementation Report

**Project**: Sesotho STEM Dictionary Builder  
**Date**: July 2026  
**Version**: 2.0 (Global Word-Building Engine)

---

## Table of Contents

1. [Project Vision & Goals](#1-project-vision--goals)
2. [Research: How World Languages Build New Words](#2-research-how-world-languages-build-new-words)
3. [The LBOS Coining Engine — Architecture](#3-the-lbos-coining-engine--architecture)
4. [Sesotho Root Dictionary](#4-sesotho-root-dictionary)
5. [Orthography & Dialect Rules](#5-orthography--dialect-rules)
6. [MzansiLLM (UCT) Alignment](#6-mzansillm-uct-alignment)
7. [System Architecture](#7-system-architecture)
8. [User Workflow](#8-user-workflow)
9. [Future Roadmap](#9-future-roadmap)

---

## 1. Project Vision & Goals

### The Problem
South African languages — particularly Sesotho (Southern Sotho) — lack comprehensive STEM (Science, Technology, Engineering, Mathematics) vocabulary. When a physics teacher in Lesotho or the Free State needs to explain "photosynthesis" or "molecule" in Sesotho, they are forced to either:

- **Use the English word** (alienating students who don't speak English fluently)
- **Use a crude loanword** like "fotosenthise" (meaningless phonetic copy)
- **Paraphrase** with a long description (impractical for textbooks)

This vocabulary gap is not unique to Sesotho — it affects all 11 official South African languages and most indigenous languages worldwide. However, it is a **solvable** problem. Languages like Chinese, Hebrew, German, and Icelandic have successfully built comprehensive native STEM vocabularies using systematic word-building strategies.

### The LBOS Solution
LBOS (Language Builder Operating System) is an AI-powered platform that:

1. **Decomposes** English STEM concepts into their functional meaning
2. **Generates** native Sesotho word candidates using multiple linguistic strategies
3. **Crowdsources** community voting and expert moderation
4. **Builds** a comprehensive, community-validated Sesotho STEM dictionary

### Core Principles
- **Meaning over Sound**: Translate what a concept *means*, not how it *sounds*
- **Native Roots First**: Use Sesotho's own rich morphological toolkit
- **Community-Driven**: Language belongs to its speakers — they must validate new words
- **AI-Assisted**: Use large language models to accelerate what historically took decades
- **Linguistically Grounded**: Every coined word must have a clear morphological explanation

---

## 2. Research: How World Languages Build New Words

### 2.1 🇨🇳 Chinese (Mandarin) — Semantic Calque

**Strategy**: Break the concept into functional parts, express each with native morphemes.

China almost never borrows sounds from foreign languages. Instead, they translate the *meaning* of a concept using existing Chinese characters (morphemes). This produces words that are "semantically transparent" — a speaker can deduce the meaning from the parts.

| English Term | Chinese | Literal Meaning | Strategy |
|:---|:---|:---|:---|
| Computer | 电脑 (diànnǎo) | "electric brain" | Semantic calque |
| Telephone | 电话 (diànhuà) | "electric speech" | Semantic calque |
| Television | 电视 (diànshì) | "electric vision" | Semantic calque |
| Microscope | 显微镜 (xiǎnwēijìng) | "reveal-tiny-mirror" | Semantic calque |
| Helicopter | 直升机 (zhíshēngjī) | "straight-rise-machine" | Semantic calque |
| Engine | 发动机 (fādòngjī) | "emit-motion-machine" | Functional description |
| Vaccine | 疫苗 (yìmiáo) | "epidemic seedling" | Metaphorical calque |
| Software | 软件 (ruǎnjiàn) | "soft item" | Semantic calque |
| Atom | 原子 (yuánzǐ) | "original particle" | Semantic calque |
| Molecule | 分子 (fēnzǐ) | "divide-particle" | Semantic calque |

**Key insight**: Even when a phonetic loanword is introduced in Chinese, it is frequently *replaced over time* by a semantic calque as the concept becomes established. The meaning-based word always wins.

**Standardization**: The China National Committee for Terms in Sciences and Technologies (CNTERM) officially reviews and approves all scientific terms.

**Lesson for Sesotho**: Instead of "enjene" (Engine), ask: *what does an engine DO?* It creates motion. In Sesotho: "setsamaisi" (se- [instrument prefix] + tsamaisa [cause to move] + -i [agentive]) = "the instrument that causes movement."

---

### 2.2 🇩🇪 German — Compounding (Zusammensetzung)

**Strategy**: Join existing words into one new compound term. The last word determines the category; preceding words narrow the meaning.

| English Term | German | Literal Meaning |
|:---|:---|:---|
| Airplane | Flugzeug | "flight-thing" |
| Lighter | Feuerzeug | "fire-thing" |
| Glove | Handschuh | "hand-shoe" |
| Vocabulary | Wortschatz | "word-treasure" |
| Linguistics | Sprachwissenschaft | "language-science" |
| Pressure gauge | Druckmessgerät | "pressure-measure-device" |
| Information highway | Datenautobahn | "data-highway" |

**Why it works**: Infinitely productive — any new concept can be named instantly by combining existing words. Native speakers decode meaning from constituent parts.

**Lesson for Sesotho**: Sesotho already does this naturally! "Matlakgohedi" (gravity) = matla (power) + kgohedi (that which attracts). The strategy should be the primary approach, not a fallback.

---

### 2.3 🇯🇵 Japanese — The Dual System

Japan uses two parallel systems for creating technical vocabulary:

**Track 1: Wasei-Kango (和製漢語)** — Japanese-made Chinese compounds created during the Meiji modernization (1868–1912). Scholars translated Western scientific concepts by combining kanji characters semantically.

| English | Japanese (Kanji) | Literal Meaning |
|:---|:---|:---|
| Science | 科学 (kagaku) | "knowledge-study" |
| Philosophy | 哲学 (tetsugaku) | "wisdom-study" |
| Semiconductor | 半導体 (handōtai) | "half-conduct-body" |
| Chemistry | 化学 (kagaku) | "change-study" |

**Track 2: Katakana Loanwords (ガイライゴ)** — Modern/fast-moving tech terms phonetically borrowed using the katakana script (e.g., コンピューター "konpyūtā" for computer).

**Key insight**: The semantic kanji words feel "native," are more respected, and endure. Katakana loanwords feel foreign. There is ongoing cultural tension between the two approaches. The Meiji-era semantic compounds were so successful they were adopted by China, Korea, and Vietnam.

---

### 2.4 🇮🇱 Hebrew — The Greatest Language Revival in History

Hebrew was a **dead liturgical language for 2,000 years** before Eliezer Ben-Yehuda and his collaborators rebuilt it as a modern spoken language in the late 1800s. They had to create words for everything from "ice cream" to "quantum physics."

**Strategy**: Trilateral root + grammatical patterns (*mishkal*)

Every Hebrew word is built from a 3-consonant root (*shoresh*) that carries core meaning. New words are coined by fitting roots into established morphological patterns.

| English | Hebrew | Root | Literal Logic |
|:---|:---|:---|:---|
| Computer | מחשב (machshev) | ח-ש-ב (ch-sh-v = think/calculate) | "thinking instrument" |
| Telegram | מברק (mivrak) | ב-ר-ק (b-r-k = lightning) | "lightning message" |
| Dictionary | מילון (milon) | From מילה (mila = word) | "word-collection" |
| Electricity | חשמל (chashmal) | Biblical word for amber | Ancient word repurposed |

**Additional strategies used**:
- Mining ancient texts (Bible, Mishna, medieval literature) for forgotten words
- Borrowing from sister Semitic languages (especially Arabic)
- Institutional standardization via the Academy of the Hebrew Language

**Parallel to Sesotho**: Just as Hebrew mined Biblical texts for roots, Sesotho can mine its own rich oral tradition, proverbs (maele), and related Bantu languages (Setswana, isiZulu, Sepedi) for roots to build new words.

---

### 2.5 🇮🇸 Iceland — The World's Most Radical Purists

Iceland has **over 45 terminology committees** dedicated to creating native words for every new technology. They categorically refuse to borrow from English.

| English | Icelandic | Literal Meaning | Method |
|:---|:---|:---|:---|
| Computer | Tölva | "number-prophetess" | Blend: tala (number) + völva (prophetess) |
| Telephone | Sími | "long thread" | Ancient word repurposed |
| Electricity | Rafmagn | "amber-power" | Compound |
| Television | Sjónvarp | "sight-cast" | Compound |
| Helicopter | Þyrla | "whirler" | Derivation |

**Key insight**: "Tölva" (number-prophetess) for computer is pure poetry. Coined words can be *more evocative* than the original English.

---

### 2.6 🇸🇦 Arabic — The Trilateral Root Engine

Arabic's 3-consonant root system is a generative engine — one root produces entire word families.

From the root **ك-ت-ب (k-t-b = writing)**:

| Pattern | Arabic Word | Meaning |
|:---|:---|:---|
| فاعل (fā'il) | كاتب (kātib) | Writer |
| مَفعَل (maf'al) | مكتب (maktab) | Office/desk |
| فِعَال (fi'āl) | كتاب (kitāb) | Book |
| مَفعُول (maf'ūl) | مكتوب (maktūb) | Written/letter |

---

### 2.7 🇹🇷 Turkey — The Language Revolution

Atatürk's 1930s reform systematically replaced thousands of Arabic/Persian loanwords with native Turkish alternatives. He personally authored a geometry textbook to establish Turkish mathematical terminology.

---

### 2.8 🇫🇮 Finland — Agglutinative Precision

Finnish, like Sesotho, is an agglutinative language. Finland uses the Sanastokeskus (Finnish Terminology Centre) to manage vocabulary, creating complex compound words by stacking morphemes.

---

### 2.9 🇰🇷 Korea — Native vs Loanword Tension

Korean uses a mix of native terms, Sino-Korean compounds (like Latin/Greek in English), and English loanwords. Both North and South Korea have had movements to replace foreign loanwords with native equivalents.

---

### 2.10 🇪🇸 Spanish — Institutional Gatekeeping

The Real Academia Española (RAE) observes usage, then validates terms once established. Strategies include Latin/Greek affixation, calque, semantic neology, and adapted borrowing.

---

### 2.11 Universal Principles Discovered

Across all 10 languages studied, the patterns are remarkably consistent:

1. **Meaning First, Sound Last**: Every successful language prioritizes translating the concept over copying the sound
2. **Use Your Own Roots**: New words should be built from the tools you already have
3. **Institutional Validation**: Every language has a body that reviews and standardizes terms
4. **Compounds Are King**: Compounding two native words is the most productive and enduring strategy
5. **Words Should Be Poetic**: The best coined words are beautiful and evocative

---

## 3. The LBOS Coining Engine — Architecture

### 3.1 The 5-Tier Strategy Hierarchy

Based on the global research, the LBOS coining engine follows a strict priority hierarchy:

| Priority | Strategy | Model Inspiration | Description |
|:---|:---|:---|:---|
| **Tier 1** 🏆 | Semantic Calque | 🇨🇳 Chinese / 🇮🇱 Hebrew | Translate the meaning using native Sesotho roots |
| **Tier 2** 🔗 | Compounding | 🇩🇪 German / 🇮🇸 Icelandic | Combine two or more native Sesotho words |
| **Tier 3** 🔧 | Nominalization | 🌍 Bantu / 🇸🇦 Arabic | Derive a noun from a Sesotho verb using class prefixes |
| **Tier 4** 🔄 | Semantic Extension | 🇯🇵 Japanese / 🇪🇸 Spanish | Repurpose an existing Sesotho word with new meaning |
| **Tier 5** ⚠️ | Loanword | Last resort | Phonetic borrowing — explicitly discouraged |

### 3.2 Concept Decomposition Pipeline

Before generating any word candidates, the engine first decomposes the English concept:

```
Input: "Engine"
├── What does it DO?     → "Creates motion / generates power"
├── What is it LIKE?     → "The heart of a machine — pumps power into movement"  
├── What is its ESSENCE? → "A force-mover / motion-creator"
└── Sesotho roots available:
    ├── ho tsamaisa (to cause to move)
    ├── matla (power/force)
    ├── ho sebetsa (to work)
    ├── mollo (fire, energy source)
    └── ho suthisa (to push forward)
```

This decomposition is displayed to users so they understand *why* each word was coined.

### 3.3 AI Integration

The engine uses Google's Gemini API with a carefully crafted prompt that:
- Teaches the AI about all 10 word-building traditions
- Provides the Sesotho Root Dictionary as context
- Requires concept decomposition before coining
- Demands at least one candidate per strategy tier
- Enforces Sesotho orthography rules
- Sorts results by tier (best first, loanword last)

When the AI is unavailable, a local heuristic fallback generates candidates using rule-based nominalization, compounding, and phonetic transliteration.

### 3.4 Example Output: "Engine"

| Tier | Word | Method | Explanation |
|:---|:---|:---|:---|
| 🏆 1 | **setsamaisi** | Semantic Calque | se- (instrument) + tsamaisa (cause movement) + -i (agentive). Like Chinese 发动机 = "emit-motion-machine" |
| 🔗 2 | **mollatsamaiso** | Compounding | mollo (fire/energy) + tsamaiso (movement). Like German Antrieb = "drive-mechanism" |
| ⚠️ 5 | ~~enjene~~ | Loanword | Phonetic borrowing — not recommended |

### 3.5 Real-World Success: "Virus" = Kokwanahloko

This is the most important example in the entire project. Sesotho speakers **already coined** a native word for "virus" using the exact compounding strategy LBOS promotes:

> **kokwanahloko** = kokwana (tiny organism/insect) + hloko (from bohloko = pain/suffering)
> 
> Literally: **"the tiny creature that brings pain"**

This proves three critical things:
1. Sesotho **already has** the word-building capacity for STEM
2. Native compounds are **more descriptive** than loanwords ("baerase" tells you nothing)
3. LBOS is not inventing a new approach — it is **scaling an existing tradition**

| Tier | Word | Method | Explanation |
|:---|:---|:---|:---|
| 🏆 1 | **kokwanahloko** | Semantic Calque | kokwana (tiny organism) + hloko (pain). Already used by native speakers! |
| 🔗 2 | **sehlaselibohloko** | Compounding | se- (agent) + hlasela (attack) + bohloko (pain). "The attacker that brings sickness" |
| 🔧 3 | **setshwayi** | Nominalization | se- (instrument) + tshwaya (infect) + -i. "That which infects" |
| ⚠️ 5 | ~~baerase~~ | Loanword | Meaningless phonetic copy — not recommended |

### 3.6 Real-World Success: "Biology" = Thutobophelo

Another beautiful example of semantic compounding in action:

> **thutobophelo** = thuto (study/education) + bophelo (life)
> 
> Literally: **"study of life"**

This mirrors the etymology of *biology* (bios = life, logos = study), as well as Chinese 生物学 and German Biologie (which translates to the study of life). It uses clear, high-quality, native Sesotho nouns that every speaker understands instantly.

| Tier | Word | Method | Explanation |
|:---|:---|:---|:---|
| 🏆 1 | **thutobophelo** | Semantic Calque | thuto (study) + bophelo (life). Direct semantic translation. |
| ⚠️ 5 | ~~baoloji~~ | Loanword | Phonetic borrowing — not recommended |

### 3.7 Differentiating Energy, Force, and Power

In everyday Sesotho, the word **matla** (strength, force, power, energy) is used interchangeably for all three concepts. However, in scientific physics, they are distinct:
- **Force** is a push or pull (Newton)
- **Energy** is the capacity to do work (Joule)
- **Power** is the rate of energy transfer (Watt)

To prevent confusion in the CAPS curriculum, LBOS uses semantic compounds and calques to differentiate them:

1. **Force** = **Tshusumetso** or **Kgatello**
   - *Tshusumetso* is derived from the verb *ho susumetsa* (to impel/push/influence) using Class 9 nominalization. It represents mechanical pushing force.
   - *Kgatello* is derived from *ho hatella* (to press/compress) and represents force as pressure/load.

2. **Energy** = **Matla-mosebetsi**
   - Compounded from *matla* (power/force) + *mosebetsi* (work).
   - Literally: **"power to do work"** (the exact scientific definition of energy).

3. **Power** = **Sekgahla sa matla** or **Matla a tshebediso**
   - *Sekgahla sa matla* is compounded from *sekgahla* (rate/speed) + *sa* (of) + *matla* (energy).
   - Literally: **"rate of energy"** (matching the Watt unit: Joules per second).
   - *Matla a tshebediso* means "operational/working power".

| Concept | Traditional | Scientific LBOS Term | Method | Literal Meaning |
|:---|:---|:---|:---|:---|
| **Force** | matla | **tshusumetso** / **kgatello** | Calque | impulse / pressure |
| **Energy** | matla | **matla-mosebetsi** | Compounding | power to do work |
| **Power** | matla | **sekgahla sa matla** | Compounding | rate of energy |

---

## 4. Sesotho Root Dictionary

The engine includes a curated dictionary of Sesotho roots organized by category:

### 4.1 Verbs (60+ entries)

**Motion & Force**: ho tsamaya (move), ho tsamaisa (cause to move), ho suthisa (push forward), ho hohela (attract/pull), ho tobetsa (push/press), ho hula (pull), ho fofela (fly), ho potoloha (revolve), ho thetsa (flow)

**Thinking & Knowledge**: ho nahana (think), ho tseba (know), ho ithuta (learn), ho ruta (teach), ho bala (count/read), ho lekanya (measure), ho akanya (reason), ho hlahloba (examine), ho hlalosa (explain), ho fumana (discover)

**Creation & Transformation**: ho bopa (create/mold), ho etsa (make/do), ho fetola (change/transform), ho kopanya (combine/unite), ho arola (divide/separate), ho nyolla (raise/elevate), ho theola (lower/decrease), ho hodisa (grow/enlarge), ho fokotsa (reduce)

**Perception & Communication**: ho bona (see), ho utlwa (hear/feel), ho bontsha (show/reveal), ho bolela (speak), ho ngola (write)

**Energy & Heat**: ho tjhesa (burn/heat), ho phatsima (shine), ho bonesa (illuminate)

**Life & Nature**: ho phela (live), ho hola (grow), ho jala (plant), ho hema (breathe), ho nwa (drink/absorb)

**Health & Disease**: ho lwala (to be sick), ho fodisa (to heal/cure), ho tshwaya (to infect/contaminate), ho hlasela (to attack/invade), ho babala (to protect/guard)

**Work & Function**: ho sebetsa (work), ho sebedisa (use/operate), ho boloka (save/store), ho romela (send), ho amohela (receive)

### 4.2 Nouns (40+ entries)

matla (power/force), leseli (light), mollo (fire/energy), metsi (water), moya (air/wind/spirit), lefatshe (earth), letsatsi (sun), kelello (mind/brain), tsebo (knowledge), palo (number), dipalo (mathematics), tlhaho (nature), bophelo (life), motlakase (electricity), lebitso (name), puo (language), ntho (thing), karolo (part), sebopeho (shape/structure), tekanyo (measurement), motswako (mixture), seipone (mirror/lens), kokwana (tiny organism/germ), bohloko (pain/suffering), lefu (death/disease), bolwetse (illness), moriana (medicine/remedy), ngaka (doctor/healer), setshila (dirt/contamination), and more.

### 4.3 Noun Class Prefix System

| Class | Prefix | Typical Use |
|:---|:---|:---|
| 1 | mo- | Person / agent (singular) |
| 2 | ba- | People / agents (plural) |
| 3 | mo- | Natural phenomenon / plant |
| 4 | me- | Natural phenomena (plural) |
| 5 | le- | Augmentative / paired |
| 6 | ma- | Mass / collection |
| 7 | **se-** | **Instrument / tool / manner** ← Most useful for STEM! |
| 8 | di- | Instruments (plural) |
| 9 | N-/e- | Animals / abstract / loanwords |
| 14 | bo- | Abstract quality / state |
| 15 | ho- | Infinitive / verbal noun |

---

## 5. Orthography & Dialect Rules

### 5.1 Gauteng/Modern Sesotho Spelling

The platform enforces modern Gauteng province spelling, which differs from traditional/Free State orthography:

| Traditional | Modern (Gauteng) | Example |
|:---|:---|:---|
| oa | **wa** | joale → **jwale** |
| oe | **we** | mantsoe → **mantswe** |
| ea | **ya** | — |

### 5.2 Known Loanword Corrections

| Incorrect | Correct | Meaning |
|:---|:---|:---|
| mochini | **motjhene** | Machine |
| mochene | **motjhene** | Machine |
| enjini | **enjene** | Engine |

### 5.3 General Rules
- No diacritics, macrons, or circumflexes (standard South African Sesotho)
- All words use plain Latin characters (a-z)
- Sesotho syllables follow CV (Consonant-Vowel) structure
- Words must end in a vowel

---

## 6. MzansiLLM (UCT) Alignment

The LBOS project is aligned with the **MzansiLLM project** from the University of Cape Town (UCT), which is building large language models for South African languages.

- **Repository**: github.com/lfroes/MzansiLLM
- **Key alignment**: Using standard SA Sesotho orthography (no macrons/circumflexes)
- **Integration**: The Gemini prompt identifies itself as "MzansiLLM-aligned" and enforces UCT project guidelines

---

## 7. System Architecture

### 7.1 Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | React + TypeScript + Vite |
| Styling | Vanilla CSS (dark glassmorphism theme) |
| Backend | Express.js + TypeScript (tsx watch) |
| Database | PostgreSQL + Drizzle ORM |
| AI Engine | Google Gemini API (gemini-2.5-flash) |
| Auth | JWT-based authentication |
| Routing | Wouter (frontend), Express Router (backend) |

### 7.2 Key Files

```
LanguageBuilders/
├── backend/
│   ├── morphology.ts      ← Coining engine (core AI + heuristics)
│   ├── routes.ts           ← API endpoints
│   ├── schema.ts           ← Database schema (Drizzle)
│   ├── db.ts               ← Database connection
│   ├── seed.ts             ← Initial data seeding
│   └── migrate.ts          ← Database migrations
├── sesosa-language-builder/
│   └── src/
│       ├── pages/
│       │   ├── Workshop.tsx          ← Coining workshop UI
│       │   ├── DictionaryExplorer.tsx ← Dictionary browser
│       │   ├── ModeratorDashboard.tsx ← Approval queue
│       │   ├── LandingPage.tsx       ← Home page
│       │   └── AuthPage.tsx          ← Login/Register
│       ├── components/
│       │   └── Navbar.tsx            ← Navigation
│       └── App.tsx                   ← Main app routing
└── artifacts/
    └── (this report)
```

### 7.3 API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/words | Fetch dictionary (search, filter, sort) |
| POST | /api/words/synthesize | Run coining engine |
| POST | /api/words/suggest | Submit word suggestion |
| POST | /api/words/:id/vote | Vote on a word (up/down) |
| POST | /api/words/:id/approve | Moderator: approve word |
| POST | /api/words/:id/decline | Moderator: decline word |

---

## 8. User Workflow

### 8.1 Word Coining Flow

```
User enters English STEM term (e.g., "molecule")
         │
         ▼
   Concept Decomposition
   ├── What does it DO?     → "Smallest unit of a compound"
   ├── What is it LIKE?     → "Tiny building blocks"
   └── What is its ESSENCE? → "Small group of atoms bonded"
         │
         ▼
   AI generates 4-5 candidates (sorted by tier)
   ├── 🏆 Tier 1: "karolwana" (karolo + diminutive = small part)
   ├── 🔗 Tier 2: compound candidate
   ├── 🔧 Tier 3: nominalization candidate
   └── ⚠️ Tier 5: "molekhule" (loanword — not recommended)
         │
         ▼
   User selects preferred candidate
         │
         ▼
   User customizes definition & etymology
         │
         ▼
   Submit for community voting
         │
         ▼
   Community votes (upvote/downvote)
         │
         ▼
   Language moderator approves/declines
         │
         ▼
   Word enters the official LBOS dictionary
```

### 8.2 User Roles

| Role | Capabilities |
|:---|:---|
| User | Coin words, vote, suggest |
| Moderator | All user capabilities + approve/decline words |

---

## 9. Future Roadmap

### Phase 2 — Expansion
- [ ] Add more South African languages (Setswana, Sepedi, isiZulu, isiXhosa)
- [ ] Build a Sesotho root corpus from digitized oral traditions and proverbs
- [ ] Export dictionary as downloadable PDF/offline database
- [ ] Mobile app (React Native)

### Phase 3 — Community & Education
- [ ] Integration with school curricula (CAPS-aligned STEM glossaries)
- [ ] Teacher dashboard for classroom vocabulary management
- [ ] Gamification (badges, streaks for contributors)
- [ ] Community forums for debating word choices

### Phase 4 — AI Enhancement
- [ ] Fine-tune a dedicated Sesotho word-building model (MzansiLLM integration)
- [ ] Learn from every approved word to improve future coining
- [ ] Auto-suggest words for the full English STEM vocabulary (~50,000 terms)
- [ ] Cross-language consistency checking (ensure Sesotho terms align with Setswana/isiZulu equivalents)

### Phase 5 — Institutional Recognition
- [ ] Partner with PanSALB (Pan South African Language Board)
- [ ] Partner with universities (UCT, Wits, UFS, NWU)
- [ ] Submit approved terms to official language bodies
- [ ] Create a formal Sesotho STEM Terminology Standard

---

## 10. Acknowledgements & References

### Acknowledgements
We would like to acknowledge the builders, authors, and contributors of the open-source materials and digital archives that served as the linguistic foundation for this system:
1. **Bukantswe Sesotho-English Bilingual Dictionary Project**: For the tab-separated bilingual lexicon dataset (`Data.RMA.Bukantswe-Sesotho-English-Bilingual.txt`) of 10,000+ entries.
2. **Demut & Sekhes (University of Lesotho)**: For their grammatical reference guide *Sotho, Basic* which structured our morphological engine and prefix binding tables.
3. **Casalis, A. (Paris Evangelical Missionary Society)**: For the historical compilation *English-Sotho Vocabulary*, printed at Morija.
4. **The Southern Sotho Bible (1961 Translation)**: For the complete linguistic corpus of Southern Sotho spelling, orthography, and sentence formatting reference.
5. **MzansiLLM Project (University of Cape Town)**: For their open-source South African language modeling standards, which aligned our Gemini model prompt orthography configurations.

### References
1. Casalis, A. (1905). *English-Sotho Vocabulary*. Morija Sesuto Book Depot.
2. Demuth, K. (1983). *Sotho, Basic*. Department of African Languages and Literature, National University of Lesotho.
3. Bukantswe Project. (2012). *Sesotho-English Bilingual Dictionary*. Open-source Lexicon Initiative.
4. British & Foreign Bible Society. (1961). *Bibele ya ho Hala: Sesotho-Southern Sotho*. London.
5. Pan South African Language Board (PanSALB). (2008). *Sesotho Spelling Rules and Orthography*. Pretoria: PanSALB.
6. Froes, L. et al. (2024). *MzansiLLM: Large Language Models for South African Languages*. University of Cape Town (UCT) / github.com/lfroes/MzansiLLM.

---

*This report was compiled as part of the LBOS project, July 2026.*
*All research and implementation by the LBOS development team.*
