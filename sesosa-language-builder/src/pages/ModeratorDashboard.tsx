import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import confetti from 'canvas-confetti';
import { ShieldCheck, ShieldAlert, Award, ThumbsUp, XCircle, CheckCircle, HelpCircle, Layers } from 'lucide-react';

interface Word {
  id: number;
  englishWord: string;
  sesothoWord: string;
  partOfSpeech: string;
  category: string;
  definition: string;
  morphology: string; // JSON string
  status: 'pending' | 'approved' | 'declined';
  createdBy: number;
  createdAt: string;
  creatorUsername: string | null;
  upvotes: number;
  downvotes: number;
}

interface ModeratorDashboardProps {
  user: any;
  token: string | null;
}

export default function ModeratorDashboard({ user, token }: ModeratorDashboardProps) {
  const [pendingWords, setPendingWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Stats
  const [totalSuggested, setTotalSuggested] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);

  const fetchPending = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch pending suggestions
      const response = await fetch('/api/words?status=pending&sortBy=votes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load pending queue');
      }
      const data = await response.json();
      setPendingWords(data);

      // 2. Fetch approved to calculate statistics
      const appResponse = await fetch('/api/words?status=approved');
      if (appResponse.ok) {
        const appData = await appResponse.json();
        setTotalApproved(appData.length);
        setTotalSuggested(data.length + appData.length);
      }
    } catch (err: any) {
      setErrorMsg('Error loading dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'moderator') {
      alert('Access Denied: Only language moderators can access this dashboard.');
      setLocation('/dictionary');
      return;
    }
    fetchPending();
  }, [user, token]);

  const handleApprove = async (wordId: number, wordName: string) => {
    try {
      const response = await fetch(`/api/words/${wordId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Approval action failed');
      }

      // Celebratory confetti burst!
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      setPendingWords(prev => prev.filter(w => w.id !== wordId));
      setTotalApproved(prev => prev + 1);
      alert(`Lentswe la "${wordName}" le amohetswe ka katleho!`);
    } catch (err: any) {
      alert('Error approving word: ' + err.message);
    }
  };

  const handleDecline = async (wordId: number, wordName: string) => {
    const confirm = window.confirm(`Na u kholo u batla ho hana lentswe la "${wordName}"? (Are you sure you want to decline this word?)`);
    if (!confirm) return;

    try {
      const response = await fetch(`/api/words/${wordId}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Decline action failed');
      }

      setPendingWords(prev => prev.filter(w => w.id !== wordId));
      alert(`Lentswe la "${wordName}" le hanilwe.`);
    } catch (err: any) {
      alert('Error declining word: ' + err.message);
    }
  };

  const parseMorphology = (morphStr: string) => {
    try {
      return JSON.parse(morphStr);
    } catch (_) {
      return { method: 'Loanword', explanation: morphStr };
    }
  };

  if (!user || user.role !== 'moderator') {
    return (
      <div className="flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
        <ShieldAlert size={48} className="text-danger" />
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)' }}>Only authorized language moderators can access this portal.</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header Panel */}
      <div className="glass-panel flex-between" style={{ padding: '2rem', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="flex-center" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', justifyContent: 'center' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Language Moderator Portal</h1>
            <p style={{ color: 'var(--text-muted)' }}>Amohela kapa u hane mantswe a macha a hlahisitsweng ke baahi.</p>
          </div>
        </div>
      </div>

      {/* Stats Counter Row */}
      <section className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{pendingWords.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Suggestions Pending Review</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>{totalApproved}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Approved Words</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{totalSuggested}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Submissions Coined</div>
        </div>
      </section>

      {/* Main Review Section */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Layers size={20} className="text-secondary" />
        <span>Mantswe a Emetseng Tlhahlobo (Pending Queue)</span>
      </h2>

      {errorMsg && (
        <div style={{ background: 'var(--accent-red-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '200px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Loading review list...</span>
        </div>
      ) : pendingWords.length === 0 ? (
        <div className="glass-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <CheckCircle size={48} className="text-primary" />
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Mosebetsi o Felile! (Queue Clean!)</h3>
            <p style={{ color: 'var(--text-muted)' }}>Ha ho na mantswe a emetseng tlhahlobo hajwale.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pendingWords.map(word => {
            const morph = parseMorphology(word.morphology);
            const netVotes = word.upvotes - word.downvotes;
            
            return (
              <div 
                key={word.id} 
                className="glass-panel" 
                style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '2rem', alignItems: 'start' }}
              >
                
                {/* Word Info details */}
                <div>
                  <div className="flex-center gap-sm" style={{ justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className="badge badge-category">{word.category}</span>
                    <span className="badge badge-pos">{word.partOfSpeech}</span>
                    <span className="flex-center gap-sm" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                      <ThumbsUp size={14} className="text-primary" />
                      <strong>{netVotes > 0 ? `+${netVotes}` : netVotes} Net Votes</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.2rem' }}>
                    {word.sesothoWord}
                  </h3>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '1.25rem' }}>
                    English Word: <strong style={{ color: '#fff' }}>{word.englishWord}</strong>
                  </h4>

                  {/* Definitions */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tlhaloso (Definition)</h5>
                    <p style={{ fontSize: '0.95rem', color: '#e5e7eb' }}>{word.definition}</p>
                  </div>

                  {/* Morphology details */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Formulation Analysis</h5>
                    <p style={{ fontSize: '0.875rem' }}>
                      <strong>Method:</strong> {morph.method} <br/>
                      <strong>Etymology:</strong> {morph.explanation}
                    </p>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                    E hlahisitsoe ke: <strong>{word.creatorUsername || 'Mosebelisi'}</strong>
                  </div>
                </div>

                {/* Moderation Actions side-panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', justifyContent: 'center' }}>
                  <button 
                    onClick={() => handleApprove(word.id, word.sesothoWord)}
                    className="btn btn-success flex-center gap-sm"
                    style={{ padding: '0.75rem' }}
                  >
                    <CheckCircle size={16} />
                    <span>Amohela (Approve)</span>
                  </button>

                  <button 
                    onClick={() => handleDecline(word.id, word.sesothoWord)}
                    className="btn btn-danger flex-center gap-sm"
                    style={{ padding: '0.75rem' }}
                  >
                    <XCircle size={16} />
                    <span>Hana (Decline)</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
