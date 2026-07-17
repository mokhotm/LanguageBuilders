import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { LogIn, UserPlus, ShieldAlert, KeyRound, User } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ho na le phoso (An error occurred)');
      }

      onLoginSuccess(data.token, data.user);
      setLocation('/dictionary');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '60vh', padding: '2rem', justifyContent: 'center', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        
        {/* Toggle Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem' }}>
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              background: 'none', 
              border: 'none', 
              color: isLogin ? 'var(--text-main)' : 'var(--text-muted)',
              borderBottom: isLogin ? '2px solid var(--primary)' : 'none',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            Kena (Login)
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              background: 'none', 
              border: 'none', 
              color: !isLogin ? 'var(--text-main)' : 'var(--text-muted)',
              borderBottom: !isLogin ? '2px solid var(--primary)' : 'none',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            Ngolisa (Register)
          </button>
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isLogin ? <LogIn size={22} className="text-primary" /> : <UserPlus size={22} className="text-primary" />}
          <span>{isLogin ? 'Kena ho LBOS' : 'Ngola Akhaonto'}</span>
        </h2>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {isLogin 
            ? 'Kena ho fihlella dipalo, ho bopa mantswe le ho vouta.' 
            : 'Fumana role ya moderator haeba u ngolisa u le wa pele kapa u sebelisa lebitso le nang le "moderator"!'
          }
        </p>

        {error && (
          <div className="flex-center gap-sm" style={{ 
            background: 'var(--accent-red-bg)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            padding: '0.8rem 1rem', 
            borderRadius: 'var(--radius-sm)',
            color: '#fca5a5',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            justifyContent: 'flex-start'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label flex-center" style={{ justifyContent: 'flex-start', gap: '0.4rem' }}>
              <User size={14} />
              <span>Lebitso la mosebelisi (Username)</span>
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="moemeli" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label flex-center" style={{ justifyContent: 'flex-start', gap: '0.4rem' }}>
              <KeyRound size={14} />
              <span>Password</span>
            </label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Ho sebetsana...' : isLogin ? 'Kena (Log In)' : 'Ngolisa (Sign Up)'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isLogin ? (
            <span>Hase u na le akhaonto? <a style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsLogin(false)}>Ngolisa Mona</a></span>
          ) : (
            <span>U se u na le akhaonto? <a style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsLogin(true)}>Kena Mona</a></span>
          )}
        </div>

      </div>
    </div>
  );
}
