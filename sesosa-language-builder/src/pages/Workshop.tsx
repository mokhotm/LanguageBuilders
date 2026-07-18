import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import confetti from 'canvas-confetti';
import { Sparkles, Hammer, Info, HelpCircle, ArrowRight, CheckCircle2, ChevronRight, Brain, Zap, AlertTriangle, Award, Star, Link2, Wrench, RefreshCw } from 'lucide-react';

interface ConceptDecomposition {
  whatItDoes: string;
  whatItIsLike: string;
  essence: string;
  relatedSesothoRoots: string[];
}

interface Candidate {
  sesothoWord: string;
  method: 'Semantic Calque' | 'Compounding' | 'Nominalization' | 'Semantic Extension' | 'Loanword' | 'User Suggestion';
  strategyTier: 1 | 2 | 3 | 4 | 5;
  prefix?: string;
  root?: string;
  suffix?: string;
  explanation: string;
  definition: string;
  partOfSpeech: string;
  inspiration?: string;
}

interface CoinResult {
  candidates: Candidate[];
  conceptDecomposition: ConceptDecomposition;
}

interface WorkshopProps {
  user: any;
  token: string | null;
}

const TIER_CONFIG: Record<number, { label: string; emoji: string; color: string; bgColor: string; icon: any }> = {
  1: { label: 'Semantic Calque', emoji: '🏆', color: '#10b981', bgColor: 'rgba(16,185,129,0.08)', icon: Star },
  2: { label: 'Compounding', emoji: '🔗', color: '#06b6d4', bgColor: 'rgba(6,182,212,0.08)', icon: Link2 },
  3: { label: 'Nominalization', emoji: '🔧', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.08)', icon: Wrench },
  4: { label: 'Semantic Extension', emoji: '🔄', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)', icon: RefreshCw },
  5: { label: 'Loanword', emoji: '⚠️', color: '#ef4444', bgColor: 'rgba(239,68,68,0.06)', icon: AlertTriangle },
};

export default function Workshop({ user, token }: WorkshopProps) {
  const [englishWord, setEnglishWord] = useState('');
  const [userHint, setUserHint] = useState('');
  const [category, setCategory] = useState<'mathematics' | 'biology' | 'physics' | 'chemistry' | 'computer_science' | 'general'>('general');
  const [partOfSpeech, setPartOfSpeech] = useState('Noun (Class 9)');
  
  // Synthesizer State
  const [synthesizing, setSynthesizing] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [conceptDecomposition, setConceptDecomposition] = useState<ConceptDecomposition | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Form Fields for final submission
  const [customSothoWord, setCustomSothoWord] = useState('');
  const [customDefinition, setCustomDefinition] = useState('');
  const [customExplanation, setCustomExplanation] = useState('');
  const [method, setMethod] = useState<string>('Semantic Calque');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const runSynthesis = async (wordToSynthesize: string, hint: string = '') => {
    if (!wordToSynthesize.trim()) return;

    if (!token) {
      alert('Kena pele u ka sebelisa workshop (Please login to synthesize words!)');
      setLocation('/auth');
      return;
    }

    setSynthesizing(true);
    setCandidates([]);
    setConceptDecomposition(null);
    setSelectedCandidate(null);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/words/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ englishWord: wordToSynthesize, userHint: hint }),
      });

      if (!response.ok) {
        throw new Error('Synthesis failed');
      }

      const data: CoinResult = await response.json();
      setCandidates(data.candidates || []);
      setConceptDecomposition(data.conceptDecomposition || null);
    } catch (err: any) {
      setErrorMsg('Error running synthesis engine: ' + err.message);
    } finally {
      setSynthesizing(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefilledWord = params.get('word');
    if (prefilledWord) {
      const clean = decodeURIComponent(prefilledWord);
      setEnglishWord(clean);
      runSynthesis(clean, '');
    }
  }, [window.location.search]);

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSynthesis(englishWord, userHint);
  };

  const selectCandidate = (c: Candidate) => {
    setSelectedCandidate(c);
    setCustomSothoWord(c.sesothoWord);
    setCustomDefinition(c.definition);
    setCustomExplanation(c.explanation);
    setMethod(c.method);
    setPartOfSpeech(c.partOfSpeech || partOfSpeech);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSothoWord.trim() || !customDefinition.trim()) {
      alert('Sotho word and definition are required!');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      englishWord,
      sesothoWord: customSothoWord.trim(),
      partOfSpeech,
      category,
      definition: customDefinition.trim(),
      morphology: JSON.stringify({
        method,
        explanation: customExplanation,
        prefix: selectedCandidate?.prefix || '',
        root: selectedCandidate?.root || '',
        suffix: selectedCandidate?.suffix || '',
        strategyTier: selectedCandidate?.strategyTier || 3,
        inspiration: selectedCandidate?.inspiration || '',
      })
    };

    try {
      const response = await fetch('/api/words/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      const isMod = user?.role === 'moderator';
      alert(isMod 
        ? `Lentswe "${customSothoWord}" le amohetswe ka katleho!` 
        : `Lentswe "${customSothoWord}" le rometsweng bakeng sa kamohelo!`);
      setLocation('/dictionary');
    } catch (err: any) {
      setErrorMsg('Error saving word: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div className="flex-between" style={{ gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Sekolo sa ho Bopa Mantswe (Coining Workshop)</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Write down an English STEM term and the AI Coining Engine will decompose the concept and generate native Sesotho words using strategies from Chinese, German, Hebrew, Icelandic, and Bantu word-building traditions.
            </p>
          </div>
          <div style={{ 
            flex: 0.8, 
            background: 'rgba(6, 182, 212, 0.04)', 
            border: '1px solid rgba(6, 182, 212, 0.15)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem 1.25rem',
            fontSize: '0.85rem'
          }}>
            <strong style={{ color: 'var(--secondary)', display: 'block', marginBottom: '0.25rem' }}>🌍 Global Word-Building AI</strong>
            <span style={{ color: 'var(--text-muted)' }}>
              Priority: 🏆 Semantic Calque → 🔗 Compounding → 🔧 Nominalization → 🔄 Extension → ⚠️ Loanword (last resort)
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: candidates.length > 0 ? '1fr' : '1fr', gap: '2rem' }}>
        
        {/* Step 1: Synthesize Input */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hammer size={18} className="text-primary" />
            <span>Enjene ya ho Bopa Mantswe (Synthesis Engine)</span>
          </h2>

          <form onSubmit={handleSynthesize} className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Technical English Term</label>
              <input
                type="text"
                className="form-input"
                placeholder="Mohlala: molecule, velocity..."
                required
                value={englishWord}
                onChange={(e) => setEnglishWord(e.target.value)}
                disabled={synthesizing || submitting}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">User Suggestion / Hint (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., use root 'hema' or sound like 'ekueshene'"
                value={userHint}
                onChange={(e) => setUserHint(e.target.value)}
                disabled={synthesizing || submitting}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subject Category</label>
              <select
                className="form-input form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                disabled={synthesizing || submitting}
              >
                <option value="physics">Physics (Fisiks)</option>
                <option value="chemistry">Chemistry (Khemistri)</option>
                <option value="biology">Biology (Baoloji)</option>
                <option value="mathematics">Mathematics (Dipalo)</option>
                <option value="computer_science">Computer Science</option>
                <option value="general">Kakaretso (General)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.75rem' }} 
              disabled={synthesizing || submitting}
            >
              {synthesizing ? 'E sa bopa...' : 'Bopa Mantswe (Synthesize)'}
            </button>
          </form>

          {errorMsg && (
            <div style={{ marginTop: '1.5rem', background: 'var(--accent-red-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '0.9rem' }}>
              {errorMsg}
            </div>
          )}
        </section>

        {/* Synthesizing Animation */}
        {synthesizing && (
          <div className="glass-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', gap: '1rem', minHeight: '200px' }}>
            <div className="glow-pulse" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)' }}></div>
            <h3 style={{ fontSize: '1.1rem' }}>Decomposing Concept & Applying Global Strategies</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>🇨🇳 Chinese calque → 🇩🇪 German compounding → 🇮🇱 Hebrew roots → 🇮🇸 Icelandic purism → 🌍 Bantu derivation...</p>
          </div>
        )}

        {/* Step 2: Concept Decomposition Panel */}
        {conceptDecomposition && !synthesizing && (
          <section className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.4s ease-out', borderLeft: '3px solid var(--primary)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={18} className="text-primary" />
              <span>Concept Decomposition — "{englishWord}"</span>
            </h2>
            
            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#10b981', fontWeight: 700, marginBottom: '0.35rem' }}>
                  ⚡ What does it DO?
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>{conceptDecomposition.whatItDoes}</p>
              </div>
              
              <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#06b6d4', fontWeight: 700, marginBottom: '0.35rem' }}>
                  🪞 What is it LIKE?
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>{conceptDecomposition.whatItIsLike}</p>
              </div>
              
              <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#8b5cf6', fontWeight: 700, marginBottom: '0.35rem' }}>
                  💎 Core ESSENCE
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>{conceptDecomposition.essence}</p>
              </div>
            </div>

            {conceptDecomposition.relatedSesothoRoots.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Sesotho Roots Used: </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {conceptDecomposition.relatedSesothoRoots.map((root, i) => (
                    <span key={i} className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.78rem' }}>
                      {root}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Step 3: Generated Candidates with Strategy Tier Badges */}
        {candidates.length > 0 && (
          <section style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>
              Likhetho tse Bopilwe (Generated Candidates)
            </h2>
            
            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '2.5rem' }}>
              {candidates.map((cand, idx) => {
                const isSelected = selectedCandidate?.sesothoWord === cand.sesothoWord;
                const tier = TIER_CONFIG[cand.strategyTier] || TIER_CONFIG[5];
                const isLoanword = cand.strategyTier === 5;
                
                return (
                  <div 
                    key={idx} 
                    className="glass-panel" 
                    style={{ 
                      padding: '1.75rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      border: isSelected ? `2px solid ${tier.color}` : isLoanword ? '1px solid rgba(239,68,68,0.15)' : '1px solid var(--border-glow)',
                      background: isSelected ? tier.bgColor : isLoanword ? 'rgba(239,68,68,0.02)' : 'var(--bg-surface)',
                      boxShadow: isSelected ? `0 0 20px ${tier.color}22` : 'var(--shadow-main)',
                      opacity: isLoanword ? 0.75 : 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      {/* Strategy Tier Badge */}
                      <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem', 
                          borderRadius: '999px',
                          background: tier.bgColor, 
                          color: tier.color, 
                          border: `1px solid ${tier.color}33`,
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                        }}>
                          <span>{tier.emoji}</span>
                          <span>Tier {cand.strategyTier}: {tier.label}</span>
                        </span>
                        <span className="badge badge-pos" style={{ fontSize: '0.7rem' }}>
                          {cand.partOfSpeech}
                        </span>
                      </div>

                      {/* Word */}
                      <h3 style={{ fontSize: '1.8rem', color: isLoanword ? '#9ca3af' : '#fff', marginBottom: '0.5rem', textDecoration: isLoanword ? 'line-through' : 'none' }}>
                        {cand.sesothoWord}
                      </h3>
                      
                      {/* Explanation */}
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        {cand.explanation}
                      </p>

                      {/* Inspiration badge */}
                      {cand.inspiration && (
                        <div style={{ 
                          background: 'rgba(255,255,255,0.02)', 
                          padding: '0.6rem 0.8rem', 
                          borderRadius: 'var(--radius-sm)', 
                          border: '1px solid rgba(255,255,255,0.04)', 
                          marginBottom: '1rem',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                        }}>
                          {cand.inspiration}
                        </div>
                      )}

                      {/* Definition */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '1.5rem' }}>
                        <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Definition</strong>
                        <span style={{ fontSize: '0.88rem' }}>{cand.definition}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => selectCandidate(cand)}
                      className={`btn ${isSelected ? 'btn-success' : isLoanword ? 'btn-outline' : 'btn-secondary'} btn-sm flex-center gap-sm`}
                      style={{ width: '100%', opacity: isLoanword && !isSelected ? 0.6 : 1 }}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>E Khethilwe (Selected)</span>
                        </>
                      ) : isLoanword ? (
                        <>
                          <AlertTriangle size={14} />
                          <span>Sebelisa Loanword (Not Recommended)</span>
                        </>
                      ) : (
                        <>
                          <span>Sebelisa Lentswe Lena</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 4: Customize and Submit Suggestion */}
        {selectedCandidate && (
          <section className="glass-panel" style={{ padding: '2.5rem', animation: 'slideUp 0.3s ease-out' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles className="text-secondary" size={20} />
              <span>Hlahloba le ho Romela (Finalize Word Coined)</span>
            </h2>

            <form onSubmit={handleFinalSubmit} className="grid-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Coined Sesotho Word</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customSothoWord}
                    onChange={(e) => setCustomSothoWord(e.target.value)}
                    required
                    style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Part of Speech</label>
                  <input
                    type="text"
                    className="form-input"
                    value={partOfSpeech}
                    onChange={(e) => setPartOfSpeech(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Word Formulation Method</label>
                  <select
                    className="form-input form-select"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="Semantic Calque">🏆 Semantic Calque (Meaning translation — best)</option>
                    <option value="Compounding">🔗 Compounding (Combined native roots)</option>
                    <option value="Nominalization">🔧 Nominalization (Class prefix/suffix derivation)</option>
                    <option value="Semantic Extension">🔄 Semantic Extension (Repurposed existing word)</option>
                    <option value="Loanword">⚠️ Loanword (Phonetic borrowing — last resort)</option>
                    <option value="User Suggestion">👤 User Suggestion</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Definition / Meaning (Tlhaloso)</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={customDefinition}
                    onChange={(e) => setCustomDefinition(e.target.value)}
                    required
                    placeholder="Tlhaloso ka Sesotho le English..."
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Morphological Origin / Etymology Details</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={customExplanation}
                    onChange={(e) => setCustomExplanation(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ minWidth: '220px', padding: '0.85rem' }} 
                  disabled={submitting}
                >
                  {submitting ? 'Ho romela...' : user?.role === 'moderator' ? 'Approve & Save Lentswe' : 'Romela ho Vouta (Submit Suggestion)'}
                </button>
              </div>

            </form>
          </section>
        )}

      </div>
    </div>
  );
}
