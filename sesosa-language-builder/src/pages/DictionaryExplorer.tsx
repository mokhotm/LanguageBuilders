import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Info, ThumbsUp, ThumbsDown, HelpCircle, Layers, Plus, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

interface Word {
  id: number;
  englishWord: string;
  sesothoWord: string;
  partOfSpeech: string;
  category: 'mathematics' | 'biology' | 'physics' | 'chemistry' | 'computer_science' | 'general';
  definition: string;
  morphology: string; // JSON string
  status: 'pending' | 'approved' | 'declined' | 'untranslated';
  createdBy: number;
  createdAt: string;
  creatorUsername: string | null;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
}

interface DictionaryExplorerProps {
  user: any;
  token: string | null;
}

export default function DictionaryExplorer({ user, token }: DictionaryExplorerProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<'approved' | 'pending' | 'declined' | 'untranslated'>('approved');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [location, setLocation] = useLocation();

  // Synchronize URL search parameters with state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('search') || '';
    if (query !== search) {
      setSearch(query);
      setStatus('approved');
    }
  }, [location, window.location.search]);

  const fetchWords = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const params: Record<string, string> = {
        search,
        category,
        status,
        sortBy,
      };
      if (selectedLetter) {
        params.letter = selectedLetter;
      }
      const queryParams = new URLSearchParams(params);

      const response = await fetch(`/api/words?${queryParams}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      const data = await response.json();
      setWords(data);

      // Auto-switch active tab based on search matches if we got results but not under current status
      if (search.trim() && data.length > 0) {
        const cleanQuery = search.trim().toLowerCase();
        
        // 1. Check for an exact match (either English or Sesotho word)
        const exactMatch = data.find((w: any) => 
          w.englishWord.toLowerCase() === cleanQuery || 
          w.sesothoWord.toLowerCase() === cleanQuery
        );

        if (exactMatch && exactMatch.status !== status) {
          setStatus(exactMatch.status as any);
        } else {
          // 2. Fall back to priority list if no exact match or already on exact match tab
          const hasApproved = data.some((w: any) => w.status === 'approved');
          const hasPending = data.some((w: any) => w.status === 'pending');
          const hasDeclined = data.some((w: any) => w.status === 'declined');
          const hasUntranslated = data.some((w: any) => w.status === 'untranslated');

          const currentStatusHasMatches = data.some((w: any) => w.status === status);

          if (!currentStatusHasMatches) {
            if (hasApproved) {
              setStatus('approved');
            } else if (hasPending) {
              setStatus('pending');
            } else if (hasUntranslated) {
              setStatus('untranslated');
            } else if (hasDeclined) {
              setStatus('declined');
            }
          }
        }
      }
    } catch (err: any) {
      setErrorMsg('Ho sitiloe ho fumana mantsoe. Suthisa kapa leka hape.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchWords();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, category, status, sortBy, selectedLetter]);

  const handleVote = async (wordId: number, currentVote: 'up' | 'down' | null, targetVote: 'up' | 'down') => {
    if (!token) {
      alert('Kena pele u ka vouta (Please login to vote!)');
      setLocation('/auth');
      return;
    }

    // Determine the next vote state
    // If user clicks upvote and is already upvoted -> remove vote (null)
    // If user clicks upvote and is downvoted or not voted -> upvote ('up')
    const voteType = currentVote === targetVote ? null : targetVote;

    try {
      const response = await fetch(`/api/words/${wordId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        throw new Error('Vote failed');
      }

      // Optimistic state update in UI
      setWords(prev => prev.map(w => {
        if (w.id === wordId) {
          let upChange = 0;
          let downChange = 0;

          // Undo old vote
          if (w.userVote === 'up') upChange -= 1;
          if (w.userVote === 'down') downChange -= 1;

          // Apply new vote
          if (voteType === 'up') upChange += 1;
          if (voteType === 'down') downChange += 1;

          return {
            ...w,
            userVote: voteType,
            upvotes: Math.max(0, w.upvotes + upChange),
            downvotes: Math.max(0, w.downvotes + downChange),
          };
        }
        return w;
      }));

      // Update selected modal word if active
      if (selectedWord && selectedWord.id === wordId) {
        setSelectedWord(prev => {
          if (!prev) return null;
          let upChange = 0;
          let downChange = 0;
          if (prev.userVote === 'up') upChange -= 1;
          if (prev.userVote === 'down') downChange -= 1;
          if (voteType === 'up') upChange += 1;
          if (voteType === 'down') downChange += 1;
          return {
            ...prev,
            userVote: voteType,
            upvotes: Math.max(0, prev.upvotes + upChange),
            downvotes: Math.max(0, prev.downvotes + downChange),
          };
        });
      }

    } catch (err: any) {
      alert('Vote recording failed: ' + err.message);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'mathematics': return '#3b82f6';
      case 'biology': return '#10b981';
      case 'physics': return '#f59e0b';
      case 'chemistry': return '#8b5cf6';
      case 'computer_science': return '#06b6d4';
      default: return 'var(--text-muted)';
    }
  };

  // Safe parsing of morphology JSON
  const parseMorphology = (morphStr: string) => {
    try {
      return JSON.parse(morphStr);
    } catch (_) {
      return { method: 'Loanword', explanation: morphStr };
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header Panel */}
      <div className="glass-panel flex-between" style={{ padding: '2rem', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Buka ya Mantswe a Sesotho</h1>
          <p style={{ color: 'var(--text-muted)' }}>Batla, vouta kapa u hlahlobe mantswe a bopilwe bakeng sa dithuto tsa STEM.</p>
        </div>
        <button onClick={() => setLocation('/workshop')} className="btn btn-primary flex-center gap-sm">
          <Plus size={18} />
          <span>Bopa Lentswe le Lecha</span>
        </button>
      </div>

      {/* Word of the Day Showcase */}
      <div className="glass-panel glass-card-glow flex-between gap-lg" style={{ 
        padding: '2.25rem', 
        marginBottom: '2.5rem', 
        background: 'radial-gradient(circle at top right, rgba(99,102,241,0.06), transparent), var(--bg-surface)',
        borderColor: 'rgba(99, 102, 241, 0.25)',
        alignItems: 'stretch',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="badge badge-category" style={{ marginBottom: '1rem', alignSelf: 'flex-start', background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', borderColor: 'rgba(99,102,241,0.2)' }}>
            <Sparkles size={12} style={{ marginRight: '0.35rem' }} />
            Lentswe la Kajeno (Word of the Day)
          </div>
          <h2 style={{ fontSize: '2.5rem', lineHeight: 1.1, color: 'white', marginBottom: '0.5rem' }}>kokwanahloko</h2>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', fontWeight: 600, marginBottom: '1.25rem' }}>
            virus <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>(Noun - Class 9)</span>
          </h3>
          <p style={{ fontSize: '1.05rem', color: '#e5e7eb', marginBottom: '1rem', maxWidth: '650px' }}>
            A microscopic infectious agent that replicates only inside the living cells of an organism. Derived natively as a compound of <strong>kokwana</strong> (tiny organism) and <strong>hloko</strong> (pain/suffering).
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', borderLeft: '3px solid var(--secondary)', paddingLeft: '0.75rem', marginBottom: '1rem', maxWidth: '650px', fontStyle: 'italic' }}>
            Sebopoana se senyenyane haholo se bakang mafu se phelang le ho ikatisa feela ka har'a lisele tse phelang tsa lintho tse ling. Se bopilwe ho tloha ho <strong>kokwana</strong> (sebopiwa se senyenyane) le <strong>hloko</strong> (bohloko kapa lefu).
          </p>
        </div>
        <div style={{ 
          flex: 1, 
          background: 'rgba(255,255,255,0.02)', 
          borderLeft: '2px solid var(--primary)', 
          padding: '1.5rem', 
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0.75rem',
          minWidth: '280px'
        }}>
          <div>
            <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Kaho ya Lentswe (Etymology)</strong>
            <span style={{ fontSize: '0.9rem' }}>Compounding of native Sesotho roots:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>kokwana</code>
            <span style={{ color: 'var(--text-muted)' }}>+</span>
            <code style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>bohloko</code>
            <span style={{ color: 'var(--text-muted)' }}>&rarr;</span>
            <span style={{ fontWeight: 600, color: 'white' }}>kokwanahloko</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            🏆 Tier 1: Semantic Calque. Proves Sesotho has organic, native word-building capabilities for advanced biology concepts.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Sidebar Filters */}
        <aside className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Search Input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Batla Lentswe (Search)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="English kapa Sesotho..."
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            </div>
          </div>

          {/* Status Tabs */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Boemo ba Lentswe (Status)</label>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)', gap: '0.2rem' }}>
              <button
                onClick={() => setStatus('approved')}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: status === 'approved' ? 'var(--primary)' : 'none',
                  color: status === 'approved' ? 'white' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Approved
              </button>
              <button
                onClick={() => setStatus('pending')}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: status === 'pending' ? 'var(--primary)' : 'none',
                  color: status === 'pending' ? 'white' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Pending
              </button>
              <button
                onClick={() => setStatus('declined')}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: status === 'declined' ? 'var(--primary)' : 'none',
                  color: status === 'declined' ? 'white' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Declined
              </button>
              <button
                onClick={() => setStatus('untranslated')}
                style={{
                  flex: 1.2,
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: status === 'untranslated' ? 'var(--primary)' : 'none',
                  color: status === 'untranslated' ? 'white' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Untranslated
              </button>
            </div>
          </div>

          {/* Category List */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Likarolo (STEM Subjects)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { id: 'all', label: 'Tsohle (All Categories)' },
                { id: 'mathematics', label: 'Mathematics (Dipalo)' },
                { id: 'biology', label: 'Biology (Baoloji)' },
                { id: 'chemistry', label: 'Chemistry (Khemistri)' },
                { id: 'physics', label: 'Physics (Fisiks)' },
                { id: 'computer_science', label: 'Computer Science' },
                { id: 'general', label: 'Kakaretso (General)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: category === cat.id ? 'rgba(99,102,241,0.3)' : 'transparent',
                    background: category === cat.id ? 'rgba(99,102,241,0.08)' : 'none',
                    color: category === cat.id ? 'var(--text-main)' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: category === cat.id ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <span style={{ 
                    display: 'inline-block', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: getCategoryColor(cat.id),
                    marginRight: '0.6rem' 
                  }}></span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Arola ka (Sort By)</label>
            <select
              className="form-input form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">E sa tsoa boptjwa (Recent)</option>
              <option value="votes">Lipalo tse holimo (Most Voted)</option>
              <option value="alphabetical">English A-Z</option>
            </select>
          </div>

        </aside>

        {/* Main Word Grid */}
        <main>
          {/* Alphabetic Letter Filter */}
          <div className="glass-panel" style={{ 
            padding: '0.75rem', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            gap: '0.35rem', 
            alignItems: 'center', 
            overflowX: 'auto', 
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            <button 
              onClick={() => setSelectedLetter('')} 
              style={{
                background: selectedLetter === '' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              Tsohle (All)
            </button>
            {'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('').map(lettr => (
              <button
                key={lettr}
                onClick={() => setSelectedLetter(lettr)}
                style={{
                  background: selectedLetter === lettr ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: '32px',
                  textAlign: 'center',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {lettr}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="glass-panel flex-center" style={{ padding: '2rem', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'var(--accent-red-bg)' }}>
              <AlertCircle size={20} style={{ marginRight: '0.5rem' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
                <div className="glow-pulse" style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>E sa kenya mantswe...</span>
              </div>
            ) : words.length === 0 ? (
              <div className="glass-panel flex-center" style={{ minHeight: '350px', flexDirection: 'column', gap: '1.5rem', padding: '3rem', textAlign: 'center' }}>
                <HelpCircle size={48} className="text-muted" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ha ho na mantswe a fumanweng</h3>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                    Ha re na mantswe a tsamaellanang le di-filters tsena. U ka bopa le ho hlahisa lentswe le lecha hona jwale!
                  </p>
                </div>
              <button onClick={() => setLocation('/workshop')} className="btn btn-primary flex-center gap-sm">
                <Plus size={16} />
                <span>Bopa Lentswe (Coin Now)</span>
              </button>
            </div>
          ) : (
            <>
              {words.length === 100 && (
                <div className="glass-panel flex-center gap-sm" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.04)', color: '#22d3ee', fontSize: '0.9rem', width: '100%' }}>
                  <Info size={16} />
                  <span>Hlahisa mantsoe a 100 a pele. Tsoela pele ho batla ho fokotsa sephetho (Showing the first 100 matches. Continue typing to refine search).</span>
                </div>
              )}
              <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {words.map(word => {
                const isUntranslated = word.status === 'untranslated';
                const morph = isUntranslated ? { method: 'Untranslated', explanation: '' } : parseMorphology(word.morphology);
                const voteScore = isUntranslated ? 0 : word.upvotes - word.downvotes;
                
                return (
                  <div 
                    key={word.id} 
                    className="glass-panel glass-card-interactive" 
                    style={{ 
                      padding: '1.75rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      border: isUntranslated ? '1px dashed rgba(255, 255, 255, 0.15)' : undefined
                    }}
                    onClick={() => {
                      if (!isUntranslated) {
                        setSelectedWord(word);
                      }
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <span className="badge badge-category" style={{ borderColor: getCategoryColor(word.category), color: getCategoryColor(word.category), background: `${getCategoryColor(word.category)}0c` }}>
                          {word.category.replace('_', ' ')}
                        </span>
                        <span className={`badge ${isUntranslated ? 'badge-pending' : word.status === 'approved' ? 'badge-approved' : word.status === 'pending' ? 'badge-pending' : 'badge-declined'}`} style={{ color: isUntranslated ? '#fbbf24' : undefined, borderColor: isUntranslated ? '#fbbf24' : undefined, background: isUntranslated ? 'rgba(251, 191, 36, 0.05)' : undefined }}>
                          {isUntranslated ? 'untranslated' : word.status}
                        </span>
                      </div>

                      {/* Words */}
                      <h3 style={{ fontSize: '1.65rem', marginBottom: '0.2rem', color: '#fff', letterSpacing: '-0.01em' }}>
                        {isUntranslated ? word.englishWord : word.sesothoWord}
                      </h3>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '1rem' }}>
                        {isUntranslated ? 'English Lexicon Term' : `${word.englishWord} (${word.partOfSpeech})`}
                      </h4>

                      {/* Definition */}
                      <p style={{ fontSize: '0.9rem', color: '#d1d5db', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.7rem' }}>
                        {isUntranslated 
                          ? 'This English word has not been translated into Sesotho yet. Be the first to coin a native word for it!'
                          : word.definition}
                      </p>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1rem' }}></div>

                    {/* Bottom Action Footer */}
                    <div className="flex-between" onClick={e => e.stopPropagation()}>
                      
                      {isUntranslated ? (
                        <button 
                          onClick={() => setLocation(`/workshop?word=${encodeURIComponent(word.englishWord)}`)}
                          className="btn btn-primary btn-sm flex-center gap-sm"
                          style={{ width: '100%', padding: '0.5rem', justifyContent: 'center' }}
                        >
                          <Plus size={14} />
                          <span>Bopa Lentswe (Coin Word)</span>
                        </button>
                      ) : (
                        <>
                          {/* Interactive Voting */}
                          <div className="flex-center gap-sm" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <button 
                              onClick={() => handleVote(word.id, word.userVote, 'up')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: word.userVote === 'up' ? 'var(--accent-green)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0.3rem',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'var(--transition-smooth)'
                              }}
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '20px', textAlign: 'center', color: voteScore > 0 ? 'var(--accent-green)' : voteScore < 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                              {voteScore > 0 ? `+${voteScore}` : voteScore}
                            </span>
                            <button 
                              onClick={() => handleVote(word.id, word.userVote, 'down')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: word.userVote === 'down' ? 'var(--accent-red)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0.3rem',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'var(--transition-smooth)'
                              }}
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </div>

                          {/* Detail triggers */}
                          <button 
                            onClick={() => setSelectedWord(word)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Info size={14} />
                            <span>Hlahloba</span>
                          </button>
                        </>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </main>
      </div>

      {/* Word Detail Modal */}
      {selectedWord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={() => setSelectedWord(null)}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              padding: '2.5rem', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.15)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            
            {/* Top Close */}
            <button 
              onClick={() => setSelectedWord(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>

            {/* Modal Badges */}
            <div className="flex-center gap-sm" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
              <span className="badge badge-category" style={{ borderColor: getCategoryColor(selectedWord.category), color: getCategoryColor(selectedWord.category), background: `${getCategoryColor(selectedWord.category)}0c` }}>
                {selectedWord.category.replace('_', ' ')}
              </span>
              <span className="badge badge-pos">{selectedWord.partOfSpeech}</span>
              <span className={`badge ${selectedWord.status === 'approved' ? 'badge-approved' : selectedWord.status === 'pending' ? 'badge-pending' : 'badge-declined'}`}>
                {selectedWord.status}
              </span>
            </div>

            {/* Word Headers */}
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>{selectedWord.sesothoWord}</h2>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '1.5rem' }}>
              English Term: <strong style={{ color: '#fff' }}>{selectedWord.englishWord}</strong>
            </h3>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}></div>

            {/* Definition */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Tlhaloso (Definition)
              </h4>
              <p style={{ fontSize: '1rem', color: '#e5e7eb' }}>
                {selectedWord.definition}
              </p>
            </div>

            {/* Morphological Analysis */}
            <div style={{ 
              background: 'rgba(99,102,241,0.04)', 
              border: '1px solid rgba(99,102,241,0.1)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.5rem',
              marginBottom: '2.5rem'
            }}>
              <h4 className="flex-center gap-sm" style={{ justifyContent: 'flex-start', fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                <BookOpen size={16} />
                <span>Kaho ea Lentswe (Morphological Origin)</span>
              </h4>
              
              {(() => {
                const morph = parseMorphology(selectedWord.morphology);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.95rem' }}>
                      <strong>Method:</strong> <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{morph.method}</span>
                    </div>
                    {morph.prefix && (
                      <div style={{ fontSize: '0.9rem' }}>
                        <strong>Class Prefix:</strong> <code style={{ color: '#fb7185', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{morph.prefix}</code>
                      </div>
                    )}
                    {morph.root && (
                      <div style={{ fontSize: '0.9rem' }}>
                        <strong>Root Concept:</strong> <code style={{ color: '#fbbf24', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{morph.root}</code>
                      </div>
                    )}
                    {morph.suffix && (
                      <div style={{ fontSize: '0.9rem' }}>
                        <strong>Suffix:</strong> <code style={{ color: '#fb7185', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{morph.suffix}</code>
                      </div>
                    )}
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      {morph.explanation}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer Metadata */}
            <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>
                E bopiloe ke: <strong style={{ color: 'var(--text-main)' }}>{selectedWord.creatorUsername || 'Mosebelisi (LBOS User)'}</strong>
              </div>
              <div>
                Ka: {new Date(selectedWord.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={() => handleVote(selectedWord.id, selectedWord.userVote, 'up')}
                className="btn btn-secondary flex-center gap-sm"
                style={{ 
                  flex: 1, 
                  borderColor: selectedWord.userVote === 'up' ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                  background: selectedWord.userVote === 'up' ? 'var(--accent-green-bg)' : 'none',
                  color: selectedWord.userVote === 'up' ? 'var(--accent-green)' : 'var(--text-main)'
                }}
              >
                <ThumbsUp size={16} />
                <span>Upvote ({selectedWord.upvotes})</span>
              </button>

              <button 
                onClick={() => handleVote(selectedWord.id, selectedWord.userVote, 'down')}
                className="btn btn-secondary flex-center gap-sm"
                style={{ 
                  flex: 1, 
                  borderColor: selectedWord.userVote === 'down' ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)',
                  background: selectedWord.userVote === 'down' ? 'var(--accent-red-bg)' : 'none',
                  color: selectedWord.userVote === 'down' ? 'var(--accent-red)' : 'var(--text-main)'
                }}
              >
                <ThumbsDown size={16} />
                <span>Downvote ({selectedWord.downvotes})</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
