import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Bypass SSL certificate revocation checks (fixes Windows CRYPT_E_NO_REVOCATION_CHECK errors)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ConceptDecomposition {
  whatItDoes: string;       // Functional description
  whatItIsLike: string;     // Metaphorical/analogical description
  essence: string;          // Core abstract meaning
  relatedSesothoRoots: string[]; // Relevant Sesotho verbs/nouns
}

export interface CoiningCandidate {
  sesothoWord: string;
  method: 'Semantic Calque' | 'Compounding' | 'Nominalization' | 'Semantic Extension' | 'Loanword' | 'User Suggestion';
  strategyTier: 1 | 2 | 3 | 4 | 5; // 1=best (Semantic Calque), 5=worst (Loanword)
  prefix?: string;
  root?: string;
  suffix?: string;
  explanation: string;
  definition: string;
  partOfSpeech: string;
  inspiration?: string; // e.g. "Chinese model: 电脑 = electric brain"
}

export interface CoinResult {
  candidates: CoiningCandidate[];
  conceptDecomposition: ConceptDecomposition;
}

// ═══════════════════════════════════════════════════════════════════════════
// SESOTHO ROOT DICTIONARY — Common verbs, nouns, adjectives for STEM mapping
// Modeled after the Hebrew root system and Chinese morpheme inventory
// ═══════════════════════════════════════════════════════════════════════════

export const SESOTHO_ROOTS = {
  // ── Verbs (ho + root) ──
  verbs: {
    // Motion & Force
    'tsamaya': { meaning: 'to walk/move/go', stems: ['tsamai', 'tsamais', 'tsamay'] },
    'tsamaisa': { meaning: 'to cause to move / drive', stems: ['tsamais'] },
    'suthisa': { meaning: 'to push forward', stems: ['suthis'] },
    'hohela': { meaning: 'to attract / pull toward', stems: ['hohel', 'kgohel'] },
    'tobetsa': { meaning: 'to push / press', stems: ['tobets'] },
    'hula': { meaning: 'to pull', stems: ['hul'] },
    'falla': { meaning: 'to move / migrate', stems: ['fall'] },
    'matha': { meaning: 'to run', stems: ['math'] },
    'fofela': { meaning: 'to fly', stems: ['fofel'] },
    'potoloha': { meaning: 'to revolve / go around', stems: ['potoloh'] },
    'thetsa': { meaning: 'to pour / flow', stems: ['thets'] },

    // Thinking & Knowledge
    'nahana': { meaning: 'to think', stems: ['nahan'] },
    'tseba': { meaning: 'to know', stems: ['tseb'] },
    'ithuta': { meaning: 'to learn / study', stems: ['ithut'] },
    'ruta': { meaning: 'to teach', stems: ['rut'] },
    'bala': { meaning: 'to count / read', stems: ['bal'] },
    'lekanya': { meaning: 'to measure / compare', stems: ['lekany'] },
    'akanya': { meaning: 'to reason / estimate', stems: ['akany'] },
    'hlahloba': { meaning: 'to examine / investigate', stems: ['hlahlob'] },
    'hlalosa': { meaning: 'to explain / define', stems: ['hlalos'] },
    'fumana': { meaning: 'to find / discover', stems: ['fuman'] },

    // Creation & Transformation
    'bopa': { meaning: 'to create / mold / build', stems: ['bop'] },
    'etsa': { meaning: 'to make / do', stems: ['ets'] },
    'fetola': { meaning: 'to change / transform', stems: ['fetol'] },
    'kopanya': { meaning: 'to combine / join / unite', stems: ['kopany'] },
    'arola': { meaning: 'to divide / separate', stems: ['arol'] },
    'hlakola': { meaning: 'to erase / dissolve', stems: ['hlakol'] },
    'nyolla': { meaning: 'to raise / elevate', stems: ['nyoll'] },
    'theola': { meaning: 'to lower / decrease', stems: ['theol'] },
    'hodisa': { meaning: 'to grow / nurture / enlarge', stems: ['hodis'] },
    'fokotsa': { meaning: 'to reduce / shrink', stems: ['fokots'] },

    // Perception & Communication
    'bona': { meaning: 'to see', stems: ['bon'] },
    'utlwa': { meaning: 'to hear / feel', stems: ['utlw'] },
    'bontsha': { meaning: 'to show / reveal / display', stems: ['bontsh'] },
    'bolela': { meaning: 'to speak / say', stems: ['bolel'] },
    'ngola': { meaning: 'to write', stems: ['ngol'] },

    // Energy & Heat
    'tjhesa': { meaning: 'to burn / heat', stems: ['tjhes'] },
    'phatsima': { meaning: 'to shine / sparkle', stems: ['phatsim'] },
    'bonesa': { meaning: 'to illuminate / light up', stems: ['bones'] },

    // Life & Nature
    'phela': { meaning: 'to live / be alive', stems: ['phel'] },
    'hola': { meaning: 'to grow', stems: ['hol'] },
    'jala': { meaning: 'to plant / sow', stems: ['jal'] },
    'kotula': { meaning: 'to harvest / reap', stems: ['kotul'] },
    'hema': { meaning: 'to breathe', stems: ['hem'] },
    'nwa': { meaning: 'to drink / absorb', stems: ['nw'] },

    // Health & Disease
    'lwala': { meaning: 'to be sick / be ill', stems: ['lwal'] },
    'fodisa': { meaning: 'to heal / cure', stems: ['fodis'] },
    'tshwaya': { meaning: 'to infect / mark / contaminate', stems: ['tshway'] },
    'hlasela': { meaning: 'to attack / invade', stems: ['hlasel'] },
    'babala': { meaning: 'to protect / guard', stems: ['babal'] },
    'tshepa': { meaning: 'to trust / to immunize (modern)', stems: ['tshep'] },

    // Work & Function
    'sebetsa': { meaning: 'to work / function', stems: ['sebets'] },
    'sebedisa': { meaning: 'to use / operate', stems: ['sebedis'] },
    'tshwara': { meaning: 'to hold / catch', stems: ['tshwar'] },
    'boloka': { meaning: 'to save / store / preserve', stems: ['bolok'] },
    'romela': { meaning: 'to send', stems: ['romel'] },
    'amohela': { meaning: 'to receive / accept', stems: ['amohel'] },
  },

  // ── Nouns ──
  nouns: {
    'matla': { meaning: 'power / force / strength', class: 6 },
    'leseli': { meaning: 'light', class: 5 },
    'mollo': { meaning: 'fire / energy', class: 3 },
    'metsi': { meaning: 'water', class: 4 },
    'moya': { meaning: 'air / wind / spirit', class: 3 },
    'lefatshe': { meaning: 'earth / land / world', class: 5 },
    'letsatsi': { meaning: 'sun / day', class: 5 },
    'kgwedi': { meaning: 'moon / month', class: 9 },
    'naleli': { meaning: 'star', class: 9 },
    'lehodimo': { meaning: 'sky / heaven', class: 5 },
    'kelello': { meaning: 'mind / brain / intelligence', class: 9 },
    'tsebo': { meaning: 'knowledge', class: 9 },
    'palo': { meaning: 'number / count', class: 9 },
    'dipalo': { meaning: 'mathematics / numbers', class: 10 },
    'tlhaho': { meaning: 'nature / creation', class: 9 },
    'bophelo': { meaning: 'life', class: 14 },
    'motlakase': { meaning: 'electricity', class: 3 },
    'lebitso': { meaning: 'name / word', class: 5 },
    'puo': { meaning: 'language / speech', class: 9 },
    'ntho': { meaning: 'thing / object', class: 9 },
    'taba': { meaning: 'matter / affair / issue', class: 9 },
    'karolo': { meaning: 'part / portion / section', class: 9 },
    'sebopeho': { meaning: 'shape / form / structure', class: 7 },
    'tekanyo': { meaning: 'measurement / equation / standard', class: 9 },
    'mohlala': { meaning: 'example / pattern / model', class: 3 },
    'mefuta': { meaning: 'types / kinds / species', class: 4 },
    'letlalo': { meaning: 'skin / surface / membrane', class: 5 },
    'masapo': { meaning: 'bones / structure', class: 6 },
    'mali': { meaning: 'blood', class: 6 },
    'pelo': { meaning: 'heart', class: 9 },
    'hlooho': { meaning: 'head', class: 9 },
    'letsoho': { meaning: 'hand / arm', class: 5 },
    'nako': { meaning: 'time', class: 9 },
    'sebaka': { meaning: 'space / place / distance', class: 7 },
    'tsela': { meaning: 'path / road / way / method', class: 9 },
    'molao': { meaning: 'law / rule', class: 3 },
    'selemo': { meaning: 'year / season', class: 7 },
    'motswako': { meaning: 'mixture / compound', class: 3 },
    'seipone': { meaning: 'mirror / lens', class: 7 },
    // Health & Disease
    'kokwana': { meaning: 'tiny organism / insect / germ / microbe', class: 9 },
    'bohloko': { meaning: 'pain / sickness / suffering', class: 14 },
    'lefu': { meaning: 'death / disease', class: 5 },
    'bolwetse': { meaning: 'illness / disease / sickness', class: 14 },
    'moriana': { meaning: 'medicine / remedy / drug', class: 3 },
    'ngaka': { meaning: 'doctor / healer', class: 9 },
    'setshila': { meaning: 'dirt / impurity / contamination', class: 7 },
  },

  // ── Adjectives / Descriptors ──
  adjectives: {
    'nyane': { meaning: 'small / tiny / micro' },
    'holo': { meaning: 'big / large / macro / great' },
    'telele': { meaning: 'long / tall' },
    'kgutshwane': { meaning: 'short / brief' },
    'potlako': { meaning: 'fast / quick / rapid' },
    'butle': { meaning: 'slow / gentle' },
    'thata': { meaning: 'hard / strong / difficult' },
    'bonolo': { meaning: 'soft / easy' },
    'tjhesang': { meaning: 'hot / burning' },
    'batang': { meaning: 'cold' },
    'boreledi': { meaning: 'smooth / slippery' },
    'bohale': { meaning: 'sharp / keen / acidic' },
    'hlwekileng': { meaning: 'clean / pure' },
  },

  // ── Noun Class Prefixes (for derivation) ──
  classPrefixes: {
    1: { prefix: 'mo-', meaning: 'person / agent (singular)' },
    2: { prefix: 'ba-', meaning: 'people / agents (plural)' },
    3: { prefix: 'mo-', meaning: 'natural phenomenon / plant (singular)' },
    4: { prefix: 'me-', meaning: 'natural phenomena / plants (plural)' },
    5: { prefix: 'le-', meaning: 'augmentative / paired (singular)' },
    6: { prefix: 'ma-', meaning: 'mass / collection (plural)' },
    7: { prefix: 'se-', meaning: 'instrument / tool / language / manner' },
    8: { prefix: 'di-', meaning: 'instruments / tools (plural)' },
    9: { prefix: 'N-/e-', meaning: 'animals / abstract / loanwords (singular)' },
    10: { prefix: 'di-/liN-', meaning: 'animals / abstract (plural)' },
    14: { prefix: 'bo-', meaning: 'abstract quality / state' },
    15: { prefix: 'ho-', meaning: 'infinitive / verbal noun' },
  },
};

// Strategy tier labels and colors for UI
export const STRATEGY_TIERS: Record<number, { label: string; emoji: string; color: string; description: string }> = {
  1: { label: 'Semantic Calque', emoji: '🏆', color: '#10b981', description: 'Translates the meaning using native Sesotho roots (Chinese/Hebrew model)' },
  2: { label: 'Compounding', emoji: '🔗', color: '#06b6d4', description: 'Combines two or more native Sesotho words (German/Icelandic model)' },
  3: { label: 'Nominalization', emoji: '🔧', color: '#8b5cf6', description: 'Derives a noun from a Sesotho verb using class prefixes (Bantu model)' },
  4: { label: 'Semantic Extension', emoji: '🔄', color: '#f59e0b', description: 'Repurposes an existing Sesotho word with a new technical meaning' },
  5: { label: 'Loanword', emoji: '⚠️', color: '#ef4444', description: 'Phonetic borrowing from English — last resort' },
};

// ═══════════════════════════════════════════════════════════════════════════
// SPELLING POST-PROCESSOR
// ═══════════════════════════════════════════════════════════════════════════

// Gauteng/modern dialect orthography correction (oa -> wa, oe -> we, ea -> ya, li -> di)
// Known loanword corrections: mochini/mochene -> motjhene (Machine), enjini -> enjene (Engine)
export function postProcessSpelling(word: string): string {
  if (!word) return '';
  return word
    .replace(/oa/g, 'wa')
    .replace(/Oa/g, 'Wa')
    .replace(/OA/g, 'WA')
    .replace(/oe/g, 'we')
    .replace(/Oe/g, 'We')
    .replace(/OE/g, 'WE')
    .replace(/ea/g, 'ya')
    .replace(/Ea/g, 'Ya')
    .replace(/EA/g, 'YA')
    .replace(/li/g, 'di')
    .replace(/Li/g, 'Di')
    .replace(/LI/g, 'DI')
    .replace(/mochini/gi, 'motjhene')
    .replace(/mochene/gi, 'motjhene')
    .replace(/enjini/gi, 'enjene')
    .replace(/enchini/gi, 'enjene')
    .replace(/mantsoe/gi, 'mantswe')
    .replace(/lentsoe/gi, 'lentswe')
    .replace(/letsoe/gi, 'letswe');
}

// ═══════════════════════════════════════════════════════════════════════════
// HEURISTIC LOANWORD GENERATOR (Fallback — Tier 5)
// ═══════════════════════════════════════════════════════════════════════════

export function synthesizeLoanword(englishWord: string): string {
  let lower = englishWord.toLowerCase().trim();
  
  if (lower.endsWith('ation')) {
    lower = lower.replace(/ation$/, 'tjshene');
  } else if (lower.endsWith('sion')) {
    lower = lower.replace(/sion$/, 'tjshene');
  } else if (lower.endsWith('ology')) {
    lower = lower.replace(/ology$/, 'oloji');
  } else if (lower.endsWith('ity')) {
    lower = lower.replace(/ity$/, 'iti');
  } else if (lower.endsWith('ics')) {
    lower = lower.replace(/ics$/, 'iki');
  } else if (lower.endsWith('ment')) {
    lower = lower.replace(/ment$/, 'mente');
  } else if (lower.endsWith('ist')) {
    lower = lower.replace(/ist$/, 'isiti');
  } else if (lower.endsWith('ism')) {
    lower = lower.replace(/ism$/, 'isime');
  } else if (lower.endsWith('e') && lower.length > 3) {
    lower = lower.slice(0, -1);
  }

  let trans = lower
    .replace(/ch/g, 'tjh')
    .replace(/sh/g, 'tjh')
    .replace(/c/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/v/g, 'b')
    .replace(/q/g, 'k')
    .replace(/z/g, 's')
    .replace(/y/g, 'i')
    .replace(/w/g, 'u')
    .replace(/g/g, 'k')
    .replace(/d/g, 't')
    .replace(/qu/g, 'kw');

  const vowels = ['a', 'e', 'i', 'o', 'u'];
  let result = '';
  
  for (let i = 0; i < trans.length; i++) {
    result += trans[i];
    if (i < trans.length - 1) {
      const currentIsConsonant = !vowels.includes(trans[i]) && trans[i] !== ' ';
      const nextIsConsonant = !vowels.includes(trans[i + 1]) && trans[i + 1] !== ' ';
      
      if (currentIsConsonant && nextIsConsonant) {
        const doubleCluster = trans[i] + trans[i + 1];
        const tripleCluster = i < trans.length - 2 ? trans[i] + trans[i + 1] + trans[i + 2] : '';
        
        if (
          ['kh', 'th', 'ph', 'sh', 'ch', 'ts', 'ny', 'hl', 'ng', 'kg', 'bh', 'tl', 'tj', 'kw', 'tw', 'nw', 'lw', 'sw'].includes(doubleCluster) ||
          tripleCluster === 'tjh' ||
          trans[i + 1] === 'h' ||
          trans[i + 1] === 'y'
        ) {
          continue;
        }
        
        if (['m', 'n'].includes(trans[i])) {
          continue;
        }

        let helper = 'e';
        for (let j = result.length - 1; j >= 0; j--) {
          if (vowels.includes(result[j])) {
            if (['o', 'u'].includes(result[j])) {
              helper = 'u';
            } else if (['a'].includes(result[j])) {
              helper = 'a';
            } else {
              helper = 'i';
            }
            break;
          }
        }
        result += helper;
      }
    }
  }

  if (!vowels.includes(result[result.length - 1])) {
    if (result.endsWith('r')) {
      result += 'a';
    } else {
      result += 'i';
    }
  }

  result = result.replace(/ee/g, 'e').replace(/ii/g, 'i').replace(/uu/g, 'u').replace(/oo/g, 'o');

  return postProcessSpelling(result);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEVERBATIVE NOMINALIZER (Tier 3)
// ═══════════════════════════════════════════════════════════════════════════

export function synthesizeDeverbative(verbRoot: string, nounClass: number, targetSuffix: 'i' | 'o'): { word: string; analysis: string; classPrefix: string } {
  const prefixMap: Record<number, string> = {
    1: 'mo', 2: 'ba', 3: 'mo', 4: 'me', 5: 'le',
    6: 'ma', 7: 'se', 8: 'di', 9: 'e', 14: 'bo', 15: 'ho',
  };

  const prefix = prefixMap[nounClass] || 'se';
  let stem = verbRoot.trim().toLowerCase();
  
  if (stem.endsWith('a')) {
    stem = stem.slice(0, -1) + targetSuffix;
  } else {
    stem = stem + targetSuffix;
  }

  let word = prefix + stem;
  let analysis = `Prefix: ${prefix}- (Class ${nounClass}), Root verb: ho ${verbRoot}, Nominalizing Suffix: -${targetSuffix}`;

  if (nounClass === 9) {
    let nasalizedStem = stem;
    if (stem.startsWith('h')) {
      nasalizedStem = 'kg' + stem.slice(1);
    } else if (stem.startsWith('r')) {
      nasalizedStem = 'th' + stem.slice(1);
    } else if (stem.startsWith('b')) {
      nasalizedStem = 'p' + stem.slice(1);
    } else if (stem.startsWith('f')) {
      nasalizedStem = 'ph' + stem.slice(1);
    } else if (stem.startsWith('l')) {
      nasalizedStem = 't' + stem.slice(1);
    }
    word = nasalizedStem;
    analysis = `Class 9 sound-change nominalization (nasalization of '${verbRoot[0]}' to '${nasalizedStem.slice(0, 2)}'), Suffix: -${targetSuffix}`;
  }

  return {
    word: postProcessSpelling(word),
    analysis,
    classPrefix: prefix,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CURATED STEM DICTIONARY (High-quality hand-crafted entries)
// ═══════════════════════════════════════════════════════════════════════════

const STEM_FALLBACKS: Record<string, { decomposition: ConceptDecomposition; candidates: CoiningCandidate[] }> = {
  gravity: {
    decomposition: {
      whatItDoes: 'Pulls objects toward each other / attracts mass',
      whatItIsLike: 'An invisible hand that holds everything down',
      essence: 'The force of attraction between objects',
      relatedSesothoRoots: ['ho hohela (to attract/pull)', 'matla (power/force)', 'ho tobetsa (to press down)'],
    },
    candidates: [
      {
        sesothoWord: 'kgohelo',
        method: 'Semantic Calque',
        strategyTier: 1,
        root: 'ho hohela (to attract/pull)',
        suffix: '-o',
        explanation: 'Like Chinese 引力 (yǐnlì = "pull-force"), this translates the MEANING: "kgohelo" = "the act of pulling/attracting". Derived from verb "ho hohela" (to attract) via Class 9 nasalization (h→kg).',
        definition: 'A force that pulls objects toward each other, particularly toward the center of the earth.',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '🇨🇳 Chinese model: 引力 = pull-force',
      },
      {
        sesothoWord: 'matlakgohedi',
        method: 'Compounding',
        strategyTier: 2,
        explanation: 'Like German "Schwerkraft" (heavy-force), this compounds two native roots: "matla" (power/force) + "kgohedi" (that which attracts, from ho hohela). Literally: "the force that attracts".',
        definition: 'Gravitational force — the power of attraction between objects with mass.',
        partOfSpeech: 'Noun (Class 6)',
        inspiration: '🇩🇪 German model: Schwerkraft = heavy-force',
      },
      {
        sesothoWord: 'kerefiti',
        method: 'Loanword',
        strategyTier: 5,
        explanation: '⚠️ Phonetic adaptation of English "gravity". While recognizable, this word tells you nothing about what gravity IS or DOES. Consider the semantic alternatives above.',
        definition: 'Gravity (borrowed term — not recommended).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '⚠️ Last resort — prefer native coinage',
      }
    ],
  },
  photosynthesis: {
    decomposition: {
      whatItDoes: 'Plants use sunlight to make food from water and air',
      whatItIsLike: 'Cooking with light — plants are light-chefs',
      essence: 'Light-powered creation of food/energy by plants',
      relatedSesothoRoots: ['leseli (light)', 'ho bopa (to create/build)', 'ho jala (to plant)', 'metswako (mixture/compound)'],
    },
    candidates: [
      {
        sesothoWord: 'popoleleseli',
        method: 'Semantic Calque',
        strategyTier: 1,
        explanation: 'Like Chinese 光合作用 (guānghézuòyòng = "light-combine-make-use"), this translates the meaning: "popo" (creation, from ho bopa) + "leseli" (light) = "creation by light". Describes what actually happens.',
        definition: 'The process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy.',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '🇨🇳 Chinese model: 光合作用 = light-combine-make-use',
      },
      {
        sesothoWord: 'metswakoleleseli',
        method: 'Compounding',
        strategyTier: 2,
        explanation: 'Compounded from "metswako" (mixtures/compounds) + "leseli" (light). Like German "Lichtaufbau" — signifies the chemical building of compounds via light energy.',
        definition: 'The synthesis of chemical compounds using light energy in plants.',
        partOfSpeech: 'Noun (Class 4)',
        inspiration: '🇩🇪 German model: compound of native roots',
      },
      {
        sesothoWord: 'fotosenthise',
        method: 'Loanword',
        strategyTier: 5,
        explanation: '⚠️ Transliterated loanword from English. Meaningless to a Sesotho speaker who doesn\'t already know English. Consider the semantic alternatives above.',
        definition: 'Photosynthesis (borrowed term — not recommended).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '⚠️ Last resort — prefer native coinage',
      }
    ],
  },
  engine: {
    decomposition: {
      whatItDoes: 'Converts energy into motion / makes things move',
      whatItIsLike: 'The heart of a machine — it pumps power into movement',
      essence: 'A force-mover / motion-creator',
      relatedSesothoRoots: ['ho tsamaisa (to cause to move)', 'matla (power)', 'ho sebetsa (to work)', 'mollo (fire/energy)'],
    },
    candidates: [
      {
        sesothoWord: 'setsamaisi',
        method: 'Semantic Calque',
        strategyTier: 1,
        prefix: 'se-',
        root: 'ho tsamaisa (to cause movement)',
        suffix: '-i (agentive)',
        explanation: 'Like Chinese 发动机 (fādòngjī = "emit-motion-machine"), this translates the meaning: "se-" (Class 7, instrument prefix) + "tsamais-" (from ho tsamaisa, to cause movement) + "-i" (agentive). Literally: "the instrument that causes movement".',
        definition: 'A device that converts energy into mechanical motion — an engine.',
        partOfSpeech: 'Noun (Class 7)',
        inspiration: '🇨🇳 Chinese model: 发动机 = emit-motion-machine',
      },
      {
        sesothoWord: 'mollatsamaiso',
        method: 'Compounding',
        strategyTier: 2,
        explanation: 'Compound: "mollo" (fire/energy) + "tsamaiso" (movement/causing to move). Like German "Antrieb" (drive-mechanism). Literally: "fire-movement" — the thing that uses fire/energy to create motion.',
        definition: 'An engine — a fire/energy-powered movement device.',
        partOfSpeech: 'Noun (Class 3)',
        inspiration: '🇩🇪 German model: Antrieb = drive-mechanism',
      },
      {
        sesothoWord: 'enjene',
        method: 'Loanword',
        strategyTier: 5,
        explanation: '⚠️ Phonetic borrowing of English "engine". While commonly used, it tells nothing about what an engine does. Consider "setsamaisi" (the instrument that causes movement) instead.',
        definition: 'Engine (borrowed term — not recommended).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '⚠️ Last resort — prefer native coinage',
      }
    ],
  },
  computer: {
    decomposition: {
      whatItDoes: 'Calculates, processes information, thinks electronically',
      whatItIsLike: 'An electric brain / a number-prophetess',
      essence: 'An electronic thinking/calculating machine',
      relatedSesothoRoots: ['kelello (mind/brain)', 'motlakase (electricity)', 'ho bala (to count/read)', 'ho nahana (to think)'],
    },
    candidates: [
      {
        sesothoWord: 'kelellomotlakase',
        method: 'Semantic Calque',
        strategyTier: 1,
        explanation: 'Direct mirror of Chinese 电脑 (diànnǎo = "electric brain"): "kelello" (mind/brain) + "motlakase" (electricity). Tells you exactly what it is — an electronic brain.',
        definition: 'A computer — an electronic device that processes information.',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '🇨🇳 Chinese: 电脑 = electric-brain',
      },
      {
        sesothoWord: 'sebali',
        method: 'Nominalization',
        strategyTier: 3,
        prefix: 'se-',
        root: 'ho bala (to count/read)',
        suffix: '-i (agentive)',
        explanation: 'Like Icelandic "tölva" (number-prophetess): "se-" (Class 7, instrument) + "bal-" (from ho bala, to count) + "-i" (agentive). Literally: "the instrument that counts".',
        definition: 'A computing device — an instrument for counting and processing.',
        partOfSpeech: 'Noun (Class 7)',
        inspiration: '🇮🇸 Icelandic: tölva = number-prophetess',
      },
      {
        sesothoWord: 'khomphyutha',
        method: 'Loanword',
        strategyTier: 5,
        explanation: '⚠️ Phonetic borrowing of English "computer". While widely used, it has no semantic content in Sesotho. Prefer "kelellomotlakase" (electric brain) or "sebali" (counting instrument).',
        definition: 'Computer (borrowed term — not recommended).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '⚠️ Last resort — prefer native coinage',
      }
    ],
  },
  molecule: {
    decomposition: {
      whatItDoes: 'The smallest unit of a chemical compound / atoms bonded together',
      whatItIsLike: 'Tiny building blocks that are themselves made of smaller blocks',
      essence: 'A small group of atoms bonded together',
      relatedSesothoRoots: ['karolo (part/portion)', 'ho kopanya (to combine/join)', 'ho arola (to divide/separate)'],
    },
    candidates: [
      {
        sesothoWord: 'karolwana',
        method: 'Semantic Calque',
        strategyTier: 1,
        root: 'karolo (part) + -wana (diminutive)',
        explanation: 'Like Chinese 分子 (fēnzǐ = "divide-particle"): "karolo" (part/portion) + "-wana" (diminutive suffix). Literally: "tiny part/portion" — the smallest divisible unit of a compound.',
        definition: 'A molecule — the smallest unit of a chemical compound that retains its chemical properties.',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '🇨🇳 Chinese: 分子 = divide-particle',
      },
      {
        sesothoWord: 'sekopanyi',
        method: 'Nominalization',
        strategyTier: 3,
        prefix: 'se-',
        root: 'ho kopanya (to combine/join)',
        suffix: '-i',
        explanation: 'From "ho kopanya" (to combine/join): "se-" (Class 7, instrument) + "kopany-" + "-i". Literally: "that which is combined" — atoms bonded together.',
        definition: 'A molecule — a combination of atoms bonded together.',
        partOfSpeech: 'Noun (Class 7)',
        inspiration: '🇸🇦 Arabic root model: deriving from verb of combination',
      },
    ],
  },
  virus: {
    decomposition: {
      whatItDoes: 'A microscopic infectious agent that invades living cells and causes disease',
      whatItIsLike: 'An invisible tiny creature that brings pain and sickness',
      essence: 'A pain-causing tiny organism — too small to see, but devastating in effect',
      relatedSesothoRoots: ['kokwana (tiny organism/insect)', 'bohloko (pain/suffering)', 'ho lwala (to be sick)', 'ho tshwaya (to infect)', 'ho hlasela (to attack/invade)'],
    },
    candidates: [
      {
        sesothoWord: 'kokwanahloko',
        method: 'Semantic Calque',
        strategyTier: 1,
        root: 'kokwana (tiny organism) + hloko (from bohloko = pain)',
        explanation: 'A REAL Sesotho word already in use by native speakers! "kokwana" (tiny organism/insect) + "hloko" (derived from bohloko = pain/suffering). Literally: "the tiny creature that brings pain". This is a perfect example of Sesotho\'s own organic compounding tradition — exactly the kind of word LBOS aims to produce. No borrowed sound, pure meaning.',
        definition: 'A virus — a microscopic infectious agent that causes disease in living organisms.',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '🌍 Sesotho native tradition — proves the language already has the word-building capacity!',
      },
      {
        sesothoWord: 'sehlaselibohloko',
        method: 'Compounding',
        strategyTier: 2,
        explanation: 'Compound: "se-" (Class 7, instrument/agent) + "hlaseli" (from ho hlasela = to attack/invade) + "bohloko" (pain/sickness). Literally: "the tiny attacker that brings sickness". Emphasizes the invasive nature of viruses.',
        definition: 'A virus — an invasive microscopic agent that attacks cells and causes illness.',
        partOfSpeech: 'Noun (Class 7)',
        inspiration: '🇩🇪 German compound model + native Sesotho roots',
      },
      {
        sesothoWord: 'setshwayi',
        method: 'Nominalization',
        strategyTier: 3,
        prefix: 'se-',
        root: 'ho tshwaya (to infect/contaminate)',
        suffix: '-i (agentive)',
        explanation: 'From "ho tshwaya" (to infect/mark): "se-" (Class 7, agent) + "tshway-" + "-i". Literally: "the thing that infects".',
        definition: 'A virus — an infectious agent.',
        partOfSpeech: 'Noun (Class 7)',
        inspiration: '🇮🇱 Hebrew root derivation model',
      },
      {
        sesothoWord: 'baerase',
        method: 'Loanword',
        strategyTier: 5,
        explanation: '⚠️ Phonetic borrowing of English "virus". Meaningless to a Sesotho speaker. The native word "kokwanahloko" (pain-causing tiny creature) is far superior — it already exists and is widely understood!',
        definition: 'Virus (borrowed term — not recommended when "kokwanahloko" already exists).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '⚠️ Last resort — "kokwanahloko" is the native word',
      }
    ],
  },
  biology: {
    decomposition: {
      whatItDoes: 'The scientific study of life and living organisms, including their structure, growth, origin, and evolution',
      whatItIsLike: 'The study of how things are born, grow, live, and die',
      essence: 'The science/education of life',
      relatedSesothoRoots: ['bophelo (life)', 'thuto (study/education)', 'ho phela (to live)', 'ho hola (to grow)'],
    },
    candidates: [
      {
        sesothoWord: 'thutobophelo',
        method: 'Semantic Calque',
        strategyTier: 1,
        root: 'thuto (study) + bophelo (life)',
        explanation: 'Direct semantic translation of biology (bios = life, logos = study). Compounded from "thuto" (study/education) + "bophelo" (life). Literally: "study of life". Mirrors Chinese 生物学 (shēngwùxué = "living-thing-study") and German Biologie (which translates to study of life). Self-explanatory and highly educational.',
        definition: 'Biology — the scientific study of life and living organisms.',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '🇨🇳 Chinese/German semantic compounding model',
      },
      {
        sesothoWord: 'baoloji',
        method: 'Loanword',
        strategyTier: 5,
        explanation: '⚠️ Phonetic borrowing of English "biology". Not recommended when "thutobophelo" is clear, transparent, and direct.',
        definition: 'Biology (borrowed term — not recommended).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '⚠️ Last resort — phonetic adaptation',
      }
    ],
  },
  energy: {
    decomposition: {
      whatItDoes: 'The capacity or ability of a physical system to perform work',
      whatItIsLike: 'The fuel that enables action or motion',
      essence: 'The capacity for doing work',
      relatedSesothoRoots: ['matla (power/force/energy)', 'ho sebetsa (to work)'],
    },
    candidates: [
      {
        sesothoWord: 'matla-mosebetsi',
        method: 'Compounding',
        strategyTier: 2,
        root: 'matla (power) + mosebetsi (work)',
        explanation: 'Compounded from "matla" (power/force) + "mosebetsi" (work) to differentiate "energy" from simple "force". Literally translates to "power to do work" (the exact physics definition of energy).',
        definition: 'Energy — the capacity of a physical system to perform work.',
        partOfSpeech: 'Noun (Class 6)',
        inspiration: '🇩🇪 German/Bantu compounding model',
      },
      {
        sesothoWord: 'matla',
        method: 'Semantic Extension',
        strategyTier: 4,
        explanation: 'Traditional general term for energy, power, and force. While widely understood, it creates scientific ambiguity if used for all three concepts.',
        definition: 'Energy (general term).',
        partOfSpeech: 'Noun (Class 6)',
        inspiration: '🔄 Traditional semantic extension',
      },
      {
        sesothoWord: 'enertjhi',
        method: 'Loanword',
        strategyTier: 5,
        explanation: '⚠️ Phonetic borrowing of English "energy". Not recommended when "matla-mosebetsi" is descriptive and scientifically precise.',
        definition: 'Energy (borrowed term — not recommended).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '⚠️ Last resort',
      }
    ],
  },
  force: {
    decomposition: {
      whatItDoes: 'An influence that causes an object to undergo a change in speed, direction, or shape (a push or pull)',
      whatItIsLike: 'A push, a pull, or pressure exerted on an object',
      essence: 'An interaction that changes the motion of an object',
      relatedSesothoRoots: ['ho hohela (to attract)', 'ho suthisa (to push)', 'tshusumetso (impulse/push)', 'kgatello (pressure)'],
    },
    candidates: [
      {
        sesothoWord: 'tshusumetso',
        method: 'Semantic Calque',
        strategyTier: 1,
        root: 'ho susumetsa (to push/impel)',
        explanation: 'Derived from the verb "ho susumetsa" (to impel/push/influence). Class 9 nominalization shifts s→tsh, yielding "tshusumetso" (the act of pushing/impelling). A clean, precise translation for force as a mechanical push.',
        definition: 'Force — a push or pull exerted on an object.',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '🇨🇳 Chinese/Hebrew semantic model',
      },
      {
        sesothoWord: 'kgatello',
        method: 'Semantic Extension',
        strategyTier: 4,
        root: 'ho hatella (to press down)',
        explanation: 'Derived from "ho hatella" (to press/force). Means force in the sense of pressure, load, or compression.',
        definition: 'Force (in the sense of compression/pressure).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '🔄 Repurposed mechanical term',
      },
      {
        sesothoWord: 'forose',
        method: 'Loanword',
        strategyTier: 5,
        explanation: '⚠️ Phonetic borrowing of English "force". Not recommended.',
        definition: 'Force (borrowed term — not recommended).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '⚠️ Last resort',
      }
    ],
  },
  power: {
    decomposition: {
      whatItDoes: 'The rate at which work is done or energy is transferred per unit of time',
      whatItIsLike: 'The speed or rate at which energy is used',
      essence: 'Rate of doing work / energy transfer speed',
      relatedSesothoRoots: ['matla (energy/power)', 'sekgahla (rate/speed)', 'tshebediso (usage)'],
    },
    candidates: [
      {
        sesothoWord: 'sekgahla sa matla',
        method: 'Compounding',
        strategyTier: 2,
        explanation: 'Compounded from "sekgahla" (rate/speed) + "sa" (of) + "matla" (energy/power). Literally: "rate of energy". This precisely matches the scientific definition of power (Energy/Time).',
        definition: 'Power — the rate of doing work or transferring energy.',
        partOfSpeech: 'Noun phrase (Class 7)',
        inspiration: '🇩🇪 German compounding model',
      },
      {
        sesothoWord: 'matla a tshebediso',
        method: 'Compounding',
        strategyTier: 2,
        explanation: 'Compounded from "matla" (power) + "a" (of) + "tshebediso" (use/operation). Literally: "operational power". Used to describe mechanical or electrical power in action.',
        definition: 'Power (in operational or mechanical context).',
        partOfSpeech: 'Noun phrase (Class 6)',
        inspiration: '🇩🇪 German compounding model',
      },
      {
        sesothoWord: 'phaore',
        method: 'Loanword',
        strategyTier: 5,
        explanation: '⚠️ Phonetic borrowing of English "power". Not recommended.',
        definition: 'Power (borrowed term — not recommended).',
        partOfSpeech: 'Noun (Class 9)',
        inspiration: '⚠️ Last resort',
      }
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COINING ENGINE — AI-Powered with Concept Decomposition Pipeline
// Inspired by: Chinese semantic calque, German compounding, Hebrew root
// derivation, Icelandic purism, Arabic pattern system
// ═══════════════════════════════════════════════════════════════════════════

function getStrategyTier(method: string): 1 | 2 | 3 | 4 | 5 {
  const map: Record<string, 1 | 2 | 3 | 4 | 5> = {
    'Semantic Calque': 1,
    'Compounding': 2,
    'Nominalization': 3,
    'Semantic Extension': 4,
    'Loanword': 5,
    'User Suggestion': 1, // user suggestions are honored at highest tier
  };
  return map[method] || 5;
}

export async function coinWord(englishWord: string, userHint?: string, excludeWords?: string[]): Promise<CoinResult> {
  const cleanWord = englishWord.toLowerCase().trim();

  // Check if we have high-quality curated entries (only if no user hint and no excludeWords)
  if (!userHint && (!excludeWords || excludeWords.length === 0) && STEM_FALLBACKS[cleanWord]) {
    const entry = STEM_FALLBACKS[cleanWord];
    return {
      candidates: entry.candidates.map(c => ({
        ...c,
        sesothoWord: postProcessSpelling(c.sesothoWord),
      })),
      conceptDecomposition: entry.decomposition,
    };
  }

  // ── AI-Powered Coining via Gemini ──
  if (GEMINI_API_KEY) {
    try {
      const defStack = await fetchDefinitionStack(cleanWord, GEMINI_API_KEY);
      const userHintSection = userHint 
        ? `\nUser Suggestion / Hint: The user has suggested "${userHint}". You MUST incorporate this hint into at least one candidate. If it's a complete word, include it as a "User Suggestion" type AND also try to use it as a root for a semantic or compound candidate.`
        : '';

      const excludeSection = excludeWords && excludeWords.length > 0
        ? `\nCRITICAL EXCLUSION RULE: Do NOT generate any of the following previously generated Sesotho words: ${excludeWords.join(', ')}. You MUST generate COMPLETELY NEW, distinct candidates using alternative Sesotho roots, metaphors, and compounding derivations!`
        : '';

      // Build available roots context for the AI
      const rootSamples = Object.entries(SESOTHO_ROOTS.verbs)
        .slice(0, 30)
        .map(([verb, info]) => `ho ${verb}: ${info.meaning}`)
        .join('\n');
      
      const nounSamples = Object.entries(SESOTHO_ROOTS.nouns)
        .slice(0, 25)
        .map(([noun, info]) => `${noun}: ${info.meaning} (Class ${info.class})`)
        .join('\n');

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are MzansiLLM, an expert in Sesotho (Southern Sotho) STEM word creation, aligned with UCT's MzansiLLM project.

Your task: Coin Sesotho words for the English STEM term: "${englishWord}"
${userHintSection}
${excludeSection}

## DEFINITION STACK & SEMANTIC ANATOMY OF "${englishWord}"
Primary Definition: "${defStack.primaryDefinition}"

To help you construct organic, natural-sounding Sesotho words that feel native rather than weird kapa literal, here are the definitions of the key concepts and building blocks that make up this definition:
${defStack.keyConcepts.map(kc => `- **${kc.term}**: ${kc.definition}`).join('\n')}

Use the definitions of these component concepts to inform how you build, compound, and nominalize Sesotho words, ensuring the resulting translations capture the functional and physical essence of the term in natural Sesotho.

## CONCEPT DECOMPOSITION (Do this first!)
Before coining, decompose the concept:
1. What does "${englishWord}" DO? (functional description)
2. What is "${englishWord}" LIKE? (metaphor/analogy)
3. What is its ESSENCE? (core abstract meaning)
4. Which Sesotho roots relate to this concept?

## WORD COINING STRATEGIES (in priority order)

### TIER 1 — Semantic Calque (BEST — Chinese/Hebrew model)
Translate the MEANING, not the sound. Ask "what does this thing DO?" and express that in Sesotho.
Example: Chinese 电脑 = electric-brain = computer. Hebrew מחשב (machshev) from root ח-ש-ב (think/calculate).
Use Sesotho roots to describe the concept functionally.

### TIER 2 — Compounding (German/Icelandic model)
Combine two native Sesotho words into one descriptive compound.
Example: German Flugzeug = flight-thing = airplane. Icelandic tölva = number-prophetess = computer.

### TIER 3 — Nominalization (Bantu/Arabic model)
Derive a noun from a Sesotho verb using class prefixes (se-, mo-, le-, bo-) and suffixes (-i, -o, -ng).
Example: ho bala (to count) → sebali (counting instrument).

### TIER 4 — Semantic Extension
Repurpose an existing Sesotho word by extending its meaning.
Example: Icelandic "sími" (long thread) → telephone.

### TIER 5 — Loanword (LAST RESORT — explicitly discourage)
Only if absolutely no semantic alternative works. Must be phonetically adapted to CV syllable structure.

## Available Sesotho Roots
${rootSamples}

## Available Sesotho Nouns
${nounSamples}

## Noun Class Prefixes
mo- (Class 1: person), ba- (Class 2: people), mo- (Class 3: nature), me- (Class 4: plural nature),
le- (Class 5: augmentative), ma- (Class 6: mass/collection), se- (Class 7: instrument/tool),
di- (Class 8: instruments plural), N-/e- (Class 9: abstract), bo- (Class 14: abstract quality), ho- (Class 15: infinitive)

## ORTHOGRAPHY RULES
- NO diacritics, macrons, or circumflexes. Use plain a-z only.
- Use Gauteng spelling: wa (not oa), we (not oe), ya (not ea), jwale (not joale).
- Modern Sesotho uses "di" instead of "li" (e.g. write "modimo" instead of "molimo", "dikobo" instead of "likobo", "senwamadi" instead of "senoamali"). Always apply this spelling pattern.

## REQUIRED OUTPUT FORMAT
Return ONLY a JSON object (no markdown). Follow this exact structure:
{
  "conceptDecomposition": {
    "whatItDoes": "string",
    "whatItIsLike": "string",
    "essence": "string",
    "relatedSesothoRoots": ["string array of relevant ho-verb and noun roots"]
  },
  "candidates": [
    {
      "sesothoWord": "string",
      "method": "Semantic Calque" | "Compounding" | "Nominalization" | "Semantic Extension" | "Loanword",
      "strategyTier": 1-5,
      "prefix": "string or null",
      "root": "string (the Sesotho root verb or noun used)",
      "suffix": "string or null",
      "explanation": "Detailed linguistic explanation including which world language model inspired it",
      "definition": "Clear English definition of the term",
      "partOfSpeech": "Noun (Class X)" or "Verb",
      "inspiration": "e.g. 🇨🇳 Chinese: 电脑 = electric-brain"
    }
  ]
}

Generate at least 4 candidates:
- At least 1 Semantic Calque (Tier 1)
- At least 1 Compound (Tier 2)  
- At least 1 Nominalization (Tier 3)
- Exactly 1 Loanword (Tier 5) — mark it as "not recommended"`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      const jsonText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        
        if (parsed.candidates && Array.isArray(parsed.candidates)) {
          const mapped: CoiningCandidate[] = parsed.candidates.map((c: any) => ({
            sesothoWord: postProcessSpelling(c.sesothoWord || 'lebitso'),
            method: c.method || 'Loanword',
            strategyTier: c.strategyTier || getStrategyTier(c.method || 'Loanword'),
            prefix: c.prefix || undefined,
            root: c.root || undefined,
            suffix: c.suffix || undefined,
            explanation: c.explanation || 'No explanation provided.',
            definition: c.definition || `Translation of ${englishWord}`,
            partOfSpeech: c.partOfSpeech || 'Noun',
            inspiration: c.inspiration || undefined,
          }));

          // Sort by strategy tier (best first)
          mapped.sort((a, b) => a.strategyTier - b.strategyTier);

          // Prepend user hint if provided
          if (userHint) {
            const processedHint = postProcessSpelling(userHint);
            const exists = mapped.some((c: CoiningCandidate) => c.sesothoWord.toLowerCase() === processedHint.toLowerCase());
            if (!exists) {
              mapped.unshift({
                sesothoWord: processedHint,
                method: 'User Suggestion',
                strategyTier: 1,
                explanation: `Lebitso le tshitshinweng ke wena: "${processedHint}". Kgetha sena ho le romela bakeng sa kamohelo.`,
                definition: `User-provided suggestion for "${englishWord}".`,
                partOfSpeech: 'Noun',
              });
            }
          }

          const decomposition: ConceptDecomposition = parsed.conceptDecomposition || {
            whatItDoes: `Describes the concept of "${englishWord}"`,
            whatItIsLike: `Related to "${englishWord}" in English`,
            essence: `The core meaning of "${englishWord}"`,
            relatedSesothoRoots: [],
          };

          let finalCandidates = mapped;
          if (excludeWords && excludeWords.length > 0) {
            const excludeSet = new Set(excludeWords.map(w => w.toLowerCase().trim()));
            finalCandidates = mapped.filter(c => !excludeSet.has(c.sesothoWord.toLowerCase().trim()));
          }

          return { candidates: finalCandidates, conceptDecomposition: decomposition };
        }
      }
    } catch (apiError: any) {
      console.warn("Gemini API call failed, falling back to heuristic synthesizer:", apiError.message);
    }
  }

  // ── LOCAL RULE-BASED FALLBACK ──
  const processedHint = userHint ? postProcessSpelling(userHint) : '';
  const loan = synthesizeLoanword(englishWord);
  const nominalized = synthesizeDeverbative(englishWord.slice(0, 5) + 'a', 7, 'o');
  
  const results: CoiningCandidate[] = [];
  
  if (processedHint) {
    results.push({
      sesothoWord: processedHint,
      method: 'User Suggestion',
      strategyTier: 1,
      explanation: `Lebitso le tshitshinweng ke wena: "${processedHint}". Kgetha sena ho le romela bakeng sa kamohelo.`,
      definition: `User-provided suggestion for "${englishWord}".`,
      partOfSpeech: 'Noun',
    });
    
    results.push({
      sesothoWord: postProcessSpelling(`se${processedHint}`),
      method: 'Nominalization',
      strategyTier: 3,
      prefix: 'se-',
      root: processedHint,
      explanation: `Nominalization: prefix 'se-' (Class 7, instrument/tool) + your suggestion "${processedHint}".`,
      definition: `Technical instrument/system representing "${englishWord}".`,
      partOfSpeech: 'Noun (Class 7)',
    });
    
    results.push({
      sesothoWord: postProcessSpelling(`matla${processedHint}`),
      method: 'Compounding',
      strategyTier: 2,
      explanation: `Compound: 'matla' (power/force) + "${processedHint}".`,
      definition: `Technical concept representing "${englishWord}".`,
      partOfSpeech: 'Noun (Class 6)',
    });
  }
  
  // Loanword (always last)
  results.push({
    sesothoWord: loan,
    method: 'Loanword',
    strategyTier: 5,
    explanation: `⚠️ Phonetic borrowing of "${englishWord}". Not recommended — consider the semantic alternatives above.`,
    definition: `Phonetic loanword for "${englishWord}" (not recommended).`,
    partOfSpeech: 'Noun (Class 9)',
    inspiration: '⚠️ Last resort — prefer native coinage',
  });
  
  if (!processedHint) {
    results.unshift({
      sesothoWord: postProcessSpelling(`se${nominalized.word}`),
      method: 'Nominalization',
      strategyTier: 3,
      prefix: 'se-',
      root: nominalized.word,
      suffix: '-o',
      explanation: `Nominalization: instrument prefix 'se-' (Class 7) + derived stem from "${englishWord}".`,
      definition: `Constructed agentive term for "${englishWord}".`,
      partOfSpeech: 'Noun (Class 7)',
    });
    results.unshift({
      sesothoWord: postProcessSpelling(`matla${loan}`),
      method: 'Compounding',
      strategyTier: 2,
      explanation: `Compound: 'matla' (power/force) + phonetic stem '${loan}'.`,
      definition: `Functional concept for "${englishWord}".`,
      partOfSpeech: 'Noun (Class 6)',
    });
  }

  // Sort by tier
  results.sort((a, b) => a.strategyTier - b.strategyTier);

  return {
    candidates: results,
    conceptDecomposition: {
      whatItDoes: `Describes the concept of "${englishWord}"`,
      whatItIsLike: `Related to "${englishWord}" in English`,
      essence: `The core meaning of "${englishWord}"`,
      relatedSesothoRoots: ['(AI unavailable — heuristic mode)'],
    },
  };
}
