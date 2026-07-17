# Sesotho Orthography & Dialect Reference
## Standard Rules for the LBOS Platform

---

## 1. Dialect Variants: Traditional vs Modern (Gauteng)

Sesotho has regional spelling variants. LBOS uses **modern/Gauteng** spelling 
as the default, which is the most widely used variant in urban South Africa.

### Vowel Digraph Differences

| Traditional (Free State/Lesotho) | Modern (Gauteng) | In Context |
|:---|:---|:---|
| **oa** | **wa** | joale → **jwale** (now) |
| **oe** | **we** | mantsoe → **mantswe** (words) |
| **ea** | **ya** | — |

### Examples in Full Words

| Traditional | Modern (LBOS Standard) | Meaning |
|:---|:---|:---|
| mantsoe | **mantswe** | words |
| lentsoe | **lentswe** | word |
| letsoe | **letswe** | stone (variant) |
| joale | **jwale** | now |
| boptjoa | **boptjwa** | created |
| fumanoeng | **fumanweng** | found |
| amohetsoe | **amohetswe** | accepted |
| hlahisitsoeng | **hlahisitsweng** | presented |

### Implementation

The `postProcessSpelling()` function in `morphology.ts` automatically converts 
traditional spelling to modern form:

```typescript
export function postProcessSpelling(word: string): string {
  return word
    .replace(/oa/g, 'wa')    // joale → jwale
    .replace(/oe/g, 'we')    // mantsoe → mantswe
    .replace(/ea/g, 'ya')    // (various)
    // + case variants (Oa→Wa, OA→WA, etc.)
}
```

---

## 2. Known Loanword Corrections

Some commonly used loanwords have specific Sesotho spellings that should be 
consistently applied:

| Incorrect / Variant | Correct Sesotho | English Source | Notes |
|:---|:---|:---|:---|
| mochini | **motjhene** | Machine | ch → tjh, i → e |
| mochene | **motjhene** | Machine | Variant spelling |
| enjini | **enjene** | Engine | i → e final |
| enchini | **enjene** | Engine | ch → j variant |

**Important distinction**:
- **Motjhene** = Machine (motjhene wa ho washa = washing machine)
- **Enjene** = Engine (enjene ya koloi = car engine)

These are different words with different meanings! Do not confuse them.

---

## 3. General Orthography Rules

### 3.1 No Diacritics
Standard South African Sesotho writing does NOT use any diacritics, macrons, 
or circumflexes on letters:

| ❌ Incorrect | ✅ Correct |
|:---|:---|
| ō | o |
| ē | e |
| š | s (or sh) |
| ô | o |

### 3.2 Syllable Structure
Sesotho follows a CV (Consonant-Vowel) syllable structure:
- Words **must end in a vowel**
- Consonant clusters are limited to specific digraphs/trigraphs

### 3.3 Valid Consonant Clusters

**Digraphs** (2 letters, 1 sound):
- kh, th, ph, sh, ch, ts, ny, hl, ng, kg, bh, tl, tj, kw, tw, nw, lw, sw

**Trigraphs** (3 letters, 1 sound):
- tjh, tsh, nts, ntl

### 3.4 Phonological Adaptations for Loanwords

When adapting English sounds to Sesotho phonology:

| English Sound | Sesotho Equivalent |
|:---|:---|
| v | b |
| z | s |
| x | ks |
| c (before a,o,u) | k |
| c (before e,i) | s |
| g | k |
| d | t |
| ch | tjh |
| sh | tjh |
| qu | kw |

### 3.5 Vowel Harmony in Helper Vowels

When breaking up consonant clusters, insert a helper vowel that harmonizes 
with the nearest preceding vowel:

| Preceding Vowel | Helper Vowel |
|:---|:---|
| o, u | u |
| a | a |
| e, i | i |

---

## 4. Noun Class Agreement

When coining new words, the noun class prefix determines grammatical agreement:

### Possessive Concords

| Class | Prefix | Possessive | Example |
|:---|:---|:---|:---|
| 1 | mo- | wa | motho **wa** mona (person of here) |
| 3 | mo- | wa | mollo **wa** letlalo (fire of skin) |
| 5 | le- | la | letsatsi **la** kajeno (sun of today) |
| 7 | se- | sa | sebali **sa** motlakase (calculator of electricity) |
| 9 | N-/e- | ya | enjene **ya** koloi (engine of car) |
| 14 | bo- | ba | bophelo **ba** motho (life of person) |

### Subject Concords

| Class | Prefix | Subject Concord | Example |
|:---|:---|:---|:---|
| 1 | mo- | o | Moruti **o** ruta (teacher teaches) |
| 7 | se- | se | Sebali **se** a bala (calculator counts) |
| 9 | N- | e | Enjene **e** a sebetsa (engine works) |

---

## 5. Gauteng vs Free State vs Lesotho Orthography

| Feature | Gauteng | Free State | Lesotho |
|:---|:---|:---|:---|
| "words" | mantswe | mantsoe | mantsoe |
| "now" | jwale | joale | joale |
| "machine" | motjhene | mochene/mochini | mochini |
| Preferred by LBOS | ✅ | — | — |

**Note**: All three forms are valid Sesotho. LBOS standardizes on Gauteng 
spelling for consistency, but the words are mutually intelligible across 
all dialects.

---

*This reference is maintained as part of the LBOS project documentation.*
