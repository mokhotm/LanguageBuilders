import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Hammer, Library, BookOpen, Layers, Award, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [coverage, setCoverage] = useState<{ total: number, correlated: number, percent: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch('/api/words/coverage')
      .then(res => res.json())
      .then(data => {
        setCoverage({
          total: data.totalEnglishWords || 0,
          correlated: data.correlatedWords || 0,
          percent: data.coveragePercentage || 0
        });
      })
      .catch(err => console.error('Failed to fetch coverage:', err));
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Hero Section */}
      <section className="glass-panel flex-between gap-lg" style={{ padding: '4rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ flex: 1, zIndex: 1 }}>
          <div className="badge badge-category" style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            <Sparkles size={12} style={{ marginRight: '0.4rem' }} />
            Morero wa LBOS (Language Builder OS)
          </div>
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 800 }}>
            Ho Bopa Mantswe a <span style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>STEM</span> ka Sesotho
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px' }}>
            Expanding Southern Sotho vocabulary for Science, Technology, Engineering, and Mathematics. LBOS is a platform combining Bantu morphological rules, phonetic algorithms, and generative AI to co-create a dictionary comparable to English.
          </p>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setLocation(`/dictionary?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginBottom: '2rem', 
              maxWidth: '500px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <input
              type="text"
              placeholder="Batla lentswe ka English kapa Sesotho (e.g. gravity)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'white',
                padding: '0.6rem 1rem',
                fontSize: '0.95rem'
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
            >
              Batla
            </button>
          </form>

          <div className="flex-center gap-md" style={{ justifyContent: 'flex-start' }}>
            <Link href="/dictionary" className="btn btn-primary flex-center gap-sm">
              <Library size={18} />
              <span>Batla Mantswe (Browse)</span>
            </Link>
            <Link href="/workshop" className="btn btn-secondary flex-center gap-sm">
              <Hammer size={18} />
              <span>Workshop ya Kaho</span>
            </Link>
          </div>
        </div>
        
        <div className="flex-center" style={{ flex: 0.8, position: 'relative', height: '350px', justifyContent: 'center' }}>
          <div className="glow-pulse" style={{ 
            width: '280px', 
            height: '280px', 
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', 
            borderRadius: '50%',
            position: 'absolute',
            zIndex: 0
          }}></div>
          
          <div className="glass-panel" style={{ 
            padding: '2rem', 
            width: '320px', 
            transform: 'rotate(-5deg)', 
            boxShadow: 'var(--shadow-main)', 
            border: '1px solid rgba(99,102,241,0.3)',
            background: 'rgba(10,15,30,0.8)',
            zIndex: 1
          }}>
            <span className="badge badge-category" style={{ marginBottom: '1rem' }}>Physics / Thutamatla</span>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>matlakgohedi</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
              Noun (Class 6)<br/>
              Prefix: matla- + Root: kgohedi
            </p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              "The force of attraction drawing objects to mass."
            </p>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }}></div>
            <div className="flex-between">
              <span className="badge badge-approved">Approved</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-green)' }}>+24 Votes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <h2 style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '2.5rem', fontWeight: 800 }}>
        Mekhoa le Melao ya ho Bopa Mantswe (Methodology)
      </h2>
      
      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', marginBottom: '1.5rem', justifyContent: 'center' }}>
            <Layers size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>1. nominalization (kaho ya mabitso)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Deriving nouns from verb roots by wrapping them in noun classes. Class prefixes (mo-, le-, se-, bo-, di-) determine attributes, while nominal suffixes (-i, -o) structure the agent or result.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(6,182,212,0.1)', color: 'var(--secondary)', marginBottom: '1.5rem', justifyContent: 'center' }}>
            <BookOpen size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>2. compounding (tsoako ya mantswe)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Fusing multiple native words to create compound concepts. Ideal for technical structures, e.g., combining "moya" (air) and "bophelo" (life) to coin "moyabophelo" for oxygen.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', marginBottom: '1.5rem', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>3. phonetic borrowing (kamohelo)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Importing English terms and wrapping them in standard Bantu phonological constraints. Clusters are resolved into Consonant-Vowel (CV) open syllables (e.g., biology &rarr; baoloji).
          </p>
        </div>
      </div>

      {/* Stats Panel */}
      <section className="glass-panel flex-between" style={{ padding: '2.5rem 4rem', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)' }}>
            {coverage ? coverage.total.toLocaleString() : '...'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>English STEM Lexicon</div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {coverage ? coverage.correlated.toLocaleString() : '...'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved Sesotho Terms</div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-green)' }}>
            {coverage ? coverage.percent.toFixed(3) + '%' : '...'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Translation Progress</div>
        </div>
      </section>
    </div>
  );
}
